import { useEffect, useState } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TrashIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Input } from "../components/ui/input";
import { Link } from 'react-router-dom';
import SchemaEditor from '../components/SchemaEditor';

type FieldType = 'nested' | 'string' | 'number' | 'boolean' | 'objectId' | 'float';

type Field = {
  key: string;
  type: FieldType;
  nestedFields?: Field[];
  locked?: boolean;
};

type SavedSchema = {
  id: string;
  title: string;
  schema: Record<string, any>;
};

function convertSchemaToFields(schema: Record<string, any>): Field[] {
  return Object.entries(schema).map(([key, value]) => {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      return {
        key,
        type: "nested",
        nestedFields: convertSchemaToFields(value),
      };
    } else {
      return {
        key,
        type: typeof value === 'string' ? (value as FieldType) : 'string',
      };
    }
  });
}

function buildSchema(fieldsList: Field[]): any {
  const result: any = {};
  for (const field of fieldsList) {
    if (!field.key) continue;
    if (field.type === "nested") {
      result[field.key] = buildSchema(field.nestedFields || []);
    } else {
      result[field.key] = field.type;
    }
  }
  return result;
}

export default function SavedSchemas() {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('savedSchemas');
    if (saved) {
      setSchemas(JSON.parse(saved));
    }
  }, []);

  const deleteSchema = (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this schema?');
    if (!confirmed) return;

    const updated = schemas.filter((s) => s.id !== id);
    setSchemas(updated);
    localStorage.setItem('savedSchemas', JSON.stringify(updated));
  };

  const startEdit = (schema: SavedSchema) => {
    setEditId(schema.id);
    setEditedTitle(schema.title);
  };

  const saveEdit = (updatedFields: Field[]) => {
    const newSchemaObj = buildSchema(updatedFields);
    const updated = schemas.map(s =>
      s.id === editId ? { ...s, title: editedTitle, schema: newSchemaObj } : s
    );
    setSchemas(updated);
    localStorage.setItem('savedSchemas', JSON.stringify(updated));
    setEditId(null);
  };

  return (
    <>
      <h1 className="text-2xl text-center text-white bg-blue-500 p-7 max-w-full mt-0 font-bold">
        Saved Schemas
      </h1>

      <div className="max-w-6xl mx-auto mt-5 space-y-6">
        {schemas.length === 0 ? (
          <p className="text-gray-500 border-4 p-4 text-center">No schemas saved.</p>
        ) : (
          schemas.map((s) => (
            <Card key={s.id} className="p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                {editId === s.id ? (
                  <Input
                    className="font-semibold flex-grow mr-4"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Schema Title"
                  />
                ) : (
                  <h2 className="text-md font-semibold flex-grow">{s.title}</h2>
                )}

                {editId !== s.id && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(s)}
                      className="flex items-center text-green-700 hover:bg-blue-500 hover:text-white gap-1"
                    >
                      <Pencil1Icon className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1 text-red-500 hover:bg-blue-500 hover:text-white"
                      onClick={() => deleteSchema(s.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {editId === s.id ? (
                <SchemaEditor
                  initialFields={convertSchemaToFields(s.schema)}
                  onSave={saveEdit}
                  onCancel={() => setEditId(null)}
                />
              ) : (
                <pre className="font-mono text-sm max-h-72 overflow-auto p-2 bg-white rounded border border-gray-300">
                  {JSON.stringify(s.schema, null, 2)}
                </pre>
              )}
            </Card>
          ))
        )}

        <Link to="/">
          <Button className="bg-blue-500 hover:bg-blue-600 m-2 text-white">
            Back
          </Button>
        </Link>
      </div>
    </>
  );
}