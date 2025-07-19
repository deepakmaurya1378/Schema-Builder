import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { PlusIcon, Cross1Icon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

type FieldType = "nested" | "string" | "number" | "boolean" | "objectId" | "float";

type Field = {
  key: string;
  type: FieldType;
  nestedFields?: Field[];
};

type Props = {
  initialFields?: Field[];
  onSave: (fields: Field[]) => void;
  onCancel: () => void;
};

export default function SchemaEditor({ initialFields = [], onSave, onCancel }: Props) {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  function addField(path?: number[]) {
    const newField: Field = { key: "", type: "string" };

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

  function renderField(field: Field, path: number[]) {
    return (
      <div key={path.join("-")} className="mb-4 pl-4 border-l-2 border-gray-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1/2">
            <Input
              placeholder="Field name"
              value={field.key}
              onChange={(e) => updateField(path, { key: e.target.value })}
            />
          </div>

          <div className="w-1/2">
            <Select
              value={field.type}
              onValueChange={(val) => updateField(path, { type: val as FieldType })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Field Type" />
              </SelectTrigger>
              <SelectContent>
                {["string", "number", "boolean", "objectId", "float", "nested"].map((typeOption) => (
                  <SelectItem key={typeOption} value={typeOption}>
                    {typeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeField(path)}
            className="text-red-500"
          >
            <Cross1Icon className="size-5" />
          </Button>
        </div>

        {field.type === "nested" && (
          <div className="ml-4">
            {field.nestedFields?.map((nested, index) => renderField(nested, [...path, index]))}
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

  return (
    <div>
      {fields.length === 0 && (
        <p className="mb-2 text-gray-500">No fields yet. Add one below.</p>
      )}

      {fields.map((field, index) => renderField(field, [index]))}

      <Button
        type="button"
        onClick={() => addField()}
        className="mt-3 mb-6 w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        <PlusIcon className="mr-2" />
        Add Field
      </Button>

      <div className="flex gap-3">
        <Button onClick={() => onSave(fields)} className="bg-green-400 hover:bg-blue-500 text-white">
          Save
        </Button>
        <Button onClick={onCancel} className="bg-blue-400 hover:bg-blue-500 text-white">
          Cancel
        </Button>
      </div>
    </div>
  );
}