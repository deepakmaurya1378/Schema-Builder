import { useEffect, useState } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { Textarea } from "../components/ui/textarea";
import { Link } from 'react-router-dom';

type SavedSchema = {
    id: string;
    title:string,
  schema: Record<string, any>;
};

export default function SavedSchemas() {
  const [schemas, setSchemas] = useState<SavedSchema[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedSchemas');
    if (saved) {
      setSchemas(JSON.parse(saved));
    }
  }, []);

  const deleteSchema = (id: string) => {
    const updated = schemas.filter((s) => s.id !== id);
    setSchemas(updated);
    localStorage.setItem('savedSchemas', JSON.stringify(updated));
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
               <h2 className="text-md font-semibold">{(s.title).toLocaleString()}</h2>

              <Button
                size="icon"
                variant="ghost"
                className="text-red-500"
                onClick={() => deleteSchema(s.id)}
              >
                <TrashIcon />
              </Button>
            </div>

            <Textarea
              className="font-mono text-sm"
              readOnly
              rows={10}
              value={JSON.stringify(s.schema, null, 2)}
            />
             </Card>)))}
                
                <Link to="/">
                <Button className="bg-blue-500 m-2">
                Back 
                </Button>
                </Link>
                
            </div>
            </>
  );
}
