import { useState } from 'react';
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PlusIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Textarea } from "../components/ui/textarea";
import { Link } from 'react-router-dom';
import { Switch} from "../components/ui/switch";

type FieldType = 'nested' | 'string' | 'number' | 'boolean' | 'objectId' | 'float';

type Field = {
  key: string;
  type: FieldType;
  nestedFields?: Field[];
  locked?: boolean;
};

export default function SchemaBuilder() {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [errors, setErrors] = useState<{title?: string; fields?: {path: string; message: string}[]}>({});
  
  function addField(path?: number[]) {
    const newField: Field = { key: '', type: 'string' };

    if (!path) {
      setFields([...fields, newField]);
    } else {
      const copy = JSON.parse(JSON.stringify(fields));
      let current = copy;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]].nestedFields || (current[path[i]].nestedFields = []);
      }
      current.push(newField);
      setFields(copy);
    }
  }

  function updateField(path: number[], data: Partial<Field>) {
    const copy = JSON.parse(JSON.stringify(fields));
    let current = copy;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].nestedFields!;
    }
    const index = path[path.length - 1];
    current[index] = { ...current[index], ...data };
    setFields(copy);
  }

  function removeField(path: number[]) {
    const copy = JSON.parse(JSON.stringify(fields));
    let current = copy;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].nestedFields!;
    }
    const index = path[path.length - 1];
    current.splice(index, 1);
    setFields(copy);
  }

  function buildSchema(fieldsList: Field[]) {
    const result: any = {};

    for (let i = 0; i < fieldsList.length; i++) {
      const field = fieldsList[i];
      if (!field.key) continue;

      if (field.type === 'nested') {
        result[field.key] = buildSchema(field.nestedFields || []);
      } else {
        result[field.key] = field.type;
      }
    }
    return result;
  }

  function toggleLockField(path: number[]) {
    const copy = JSON.parse(JSON.stringify(fields));
    let current = copy;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]].nestedFields!;
    }
    const index = path[path.length - 1];
    current[index].locked = !current[index].locked;
    setFields(copy);
  }

  function renderField(field: Field, path: number[]) {
    const pathString = path.join('-');
    const fieldError = errors.fields?.find(e => e.path === pathString);
    
    return (
      <div key={pathString} className="mb-4 pl-4">
        <div className={`flex items-center gap-2 mb-2 ${fieldError ? 'border-l-2 border-red-500 pl-2' : ''}`}>
          <div className="w-1/2">
            <Input
              placeholder="Field name"
              value={field.key}
              disabled={field.locked}
              onChange={(e) => updateField(path, { key: e.target.value })}
              className={fieldError ? 'border-red-500' : ''}
            />
            {fieldError && (
              <p className="text-red-500 text-xs mt-1">{fieldError.message}</p>
            )}
          </div>

          <div className="w-1/2">
            <Select
              value={field.type}
              disabled={field.locked}
              onValueChange={(val) => updateField(path, { type: val as FieldType })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Field Type" />
              </SelectTrigger>
              <SelectContent>
                {['string', 'number', 'boolean', 'objectId', 'float', 'nested'].map((typeOption) => (
                  <SelectItem key={typeOption} value={typeOption}>
                    {typeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Switch
            checked={field.locked}
            onCheckedChange={() => toggleLockField(path)}
            className="data-[state=unchecked]:bg-gray-300 data-[state=checked]:bg-orange-300"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeField(path)}
            className="text-red-500"
          >
            <Cross1Icon className='size-5' />
          </Button>
        </div>

        {field.type === 'nested' && (
          <div className="w-full pt-4 border-l-3 border-blue-300">
            {field.nestedFields?.map((nested, index) =>
              renderField(nested, [...path, index])
            )}
            <Button
              type="button"
              onClick={() => addField(path)}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
            >
              <PlusIcon className="mr-1" />
              Add Field
            </Button>
          </div>
        )}
      </div>
    );
  }
  

  function validateFields(fieldsList: Field[], path: number[] = [], errorsList: {path: string; message: string}[] = []) {
    for (let i = 0; i < fieldsList.length; i++) {
      const field = fieldsList[i];
      const currentPath = [...path, i];
      const pathString = currentPath.join('-');
      
      if (!field.key.trim()) {
        errorsList.push({
          path: pathString,
          message: `Field name is required  ${path.length > 0 ? ` in nested group.` : ''}`
        });
      }
      
      if (field.type === 'nested' && (!field.nestedFields || field.nestedFields.length === 0)) {
        errorsList.push({
          path: pathString,
          message: `Nested field  must have at least one nested field.`
        });
      }
      
      if (field.type === 'nested' && field.nestedFields) {
        validateFields(field.nestedFields, currentPath, errorsList);
      }
    }
    
    return errorsList;
  }
  
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});
    if (!title.trim()) {
      setErrors({ title: 'Schema title is required.' });
      return;
    }
    const fieldErrors = validateFields(fields);
    if (fieldErrors.length > 0) {
      setErrors({ fields: fieldErrors });
      return;
    }
    const schemaData = buildSchema(fields);
    const savedSchemasRaw = localStorage.getItem('savedSchemas');
    const savedArray = savedSchemasRaw ? JSON.parse(savedSchemasRaw) : [];
    const duplicate = savedArray.some((s: any) => s.title === title);
  
    if (duplicate) {
      window.alert(`A schema with the title "${title}" already exists.`);
      return;
    }

    const newSchema = {
      title: title.trim(),
      id: new Date().toISOString(),
      schema: schemaData,
    };
    savedArray.push(newSchema);
    localStorage.setItem('savedSchemas', JSON.stringify(savedArray));
  
    window.alert(`Schema "${newSchema.title}" saved successfully!`);
  }

  const liveSchema = buildSchema(fields);

  return (
    <>
      <h1 className='bg-blue-500 font-bold p-8 text-center text-white text-2xl'>JSON Schema Builder</h1>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5">
            <div>
              <h1 className="text-center font-bold">Schema Title</h1>
              <Input
                id="schema-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter schema title"
                className={`mt-2 ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="mt-2 space-y-3">
              {fields.map((field, index) => renderField(field, [index]))}
            </div>

            <Button
              type="button"
              onClick={() => addField()}
              className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <PlusIcon className="mr-2" />
              Add Field
            </Button>

            <div className="flex gap-3 mt-6">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Save Schema
              </Button>

              <Link to="/saved-schemas">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  View Saved Schemas
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl text-center font-bold mb-4">Live {title} Schema Preview</h2>
            <Textarea
              rows={20}
              className="text-xl h-[500px]"
              readOnly
              value={JSON.stringify(liveSchema, null, 2)}
            />
          </Card>
        </div>
      </form>
    </>
  );
}