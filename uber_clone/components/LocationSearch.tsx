"use client";

import { useState } from "react";

export default function LocationSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);

    return (
        <div>
            <input
                type="text"
                placeholder="Enter Your location"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
    );
}