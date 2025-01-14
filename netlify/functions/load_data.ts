import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Handler } from "@netlify/functions";

function initializeFirebase() {
    const firebaseConfig = {
        apiKey: process.env.API_KEY,
        authDomain: "prague-castle-escape.firebaseapp.com",
        projectId: "prague-castle-escape",
        storageBucket: "prague-castle-escape.firebasestorage.app",
        messagingSenderId: "881766941895",
        appId: "1:881766941895:web:2e48cdccfed83da176eae2",
        measurementId: "G-SBLJL2NW6L"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    return { db };
}

async function loadData() {
    const { db } = initializeFirebase();
    const resultsRef = collection(db, "results");
    const q = query(resultsRef, orderBy("duration"));

    return new Promise((resolve, reject) => {
        onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                resolve([]);
                return;
            }

            const data = [];
            querySnapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({ id: doc.id, ...docData });
            });

            resolve(data);
        },
            reject);
    });
}


const handler: Handler = async () => {
    try {
        const data = await loadData();
        return {statusCode: 200, body: JSON.stringify(data)};
    }
    catch (error) {
        return {statusCode: 500, body: JSON.stringify({ message: "Error loading data", error: error.message })};
    }
};

module.exports = { handler };