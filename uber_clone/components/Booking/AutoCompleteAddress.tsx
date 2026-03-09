"use client";
import { useState } from "react";

interface Place {
    lat: string;
    lon: string;
    display_name: string;
}

interface Props {
    placeholder: string;
    onSelect: (lat: number, lon: number, name: string) => void;
}

export default function AutoCompleteAddress({ placeholder, onSelect }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    const search = async (value: string) => {
        setQuery(value);

        if (value.length < 3) {
            setResults([]);
            return;
        }

        const res = await fetch(`http://localhost:4000/api/maps/search?q=${value}`);

        const data = await res.json();
        setResults(data);
    };
    return (
        <div className='mb-4'>
            <div>
                <input type="text" className='bg-white p-1 border w-full rounded-md' value={query}
                    onChange={(e) => search(e.target.value)} placeholder={placeholder} />

                {results.length > 0 && (
                    <ul className="absolute bg-white border w-118 max-h-60 overflow-y-auto z-10 shadow-lg">
                        {results.map((place, index) => (
                            <li
                                key={index}
                                className="p-2 hover:bg-gray-200 cursor-pointer text-sm"
                                onClick={() => {
                                    setQuery(place.display_name);
                                    setResults([]);
                                    onSelect(
                                        parseFloat(place.lat),
                                        parseFloat(place.lon),
                                        place.display_name
                                    );
                                }}
                            >
                                {place.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}