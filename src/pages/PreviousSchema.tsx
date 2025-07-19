import { useEffect, useState } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TrashIcon, Pencil1Icon, CheckIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Link } from 'react-router-dom';

type SavedSchema = {
  id: string;
  title: string;
  schema: Record<string, any>;
};

export default function SavedSchemas() {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSchema, setEditedSchema] = useState('');

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
    setEditedSchema(JSON.stringify(schema.schema, null, 2));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedTitle('');
    setEditedSchema('');
  };

  const saveEdit = (id: string) => {
    try {
      const parseddata = JSON.parse(editedSchema);
      const updated = schemas.map(s =>
        s.id === id ? { ...s, title: editedTitle, schema: parseddata } : s
      );
      setSchemas(updated);
      localStorage.setItem('savedSchemas', JSON.stringify(updated));
      cancelEdit();
    } catch (err) {
      alert("Invalid JSON in schema!");
    }
  };

  return (
    <>
      <h1 className="text-2xl text-center text-white bg-blue-500 p-7 max-w-full mt-0 font-bold">Saved Schemas</h1>
      <div className="max-w-6xl mx-auto mt-5 space-y-6">
        {schemas.length === 0 ? (
          <p className="text-gray-500 border-4">No schemas saved.</p>
        ) : (
          schemas.map((s) => (
            <Card key={s.id} className="p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                {editId === s.id ? (
                  <Input
                    className="font-semibold"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                ) : (
                  <h2 className="text-md font-semibold">{s.title}</h2>
                      )}
                      
            <div className="flex items-center space-x-2 ">
                {editId === s.id ? (
                  <>
                    <Button size="icon" variant="ghost" className='hover:bg-blue-500 hover:text-white m-2 shadow-md border-black' onClick={() => saveEdit(s.id)} aria-label="Save">
                      <CheckIcon className="w-4 h-4 " />
                    </Button>
                    <Button size="icon" variant="ghost" className='hover:bg-blue-500 hover:text-white shadow-md border-black m-2' onClick={cancelEdit} aria-label="Cancel">
                      <Cross1Icon className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(s)}
                      className="flex items-center border-red border-2  text-green-700 hover:bg-blue-500 hover:text-white gap-1"
                    >
                      <Pencil1Icon className="w-4 h-4 " />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex items-center gap-1 border-2 border-red text-red-500 hover:bg-blue-500 hover:text-white"
                      onClick={() => deleteSchema(s.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
                  
              <Textarea
                className="font-mono text-sm"
                readOnly={editId !== s.id}
                rows={10}
                value={editId === s.id ? editedSchema : JSON.stringify(s.schema, null, 2)}
                onChange={(e) => setEditedSchema(e.target.value)}
              />
              </Card>
            ))
              )}
              
        <Link to="/">
          <Button className="bg-blue-500 hover:bg-blue-600 m-2">
            Back
          </Button>
        </Link>
      </div>
    </>
  );
}
