import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
export async function updateBalance(
  // db: any,
  userID: string,
  newAmount: number
) {
  const q = query(collection(db, "balance"), where("phone", "==", userID));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const docRef = doc.ref;

    // Update the amount field
    updateDoc(docRef, {
      amount: newAmount,
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  });
}
export async function deleteBet(
  userID: string,
  betno: number,
  bet: number,
  status: string
) {
  // Create a query against the collection to find the document(s)
  const q = query(
    collection(db, "bets"),
    where("phone", "==", userID),
    where("bet", "==", bet),
    where("betno", "==", betno),
    where("status", "==", status)
  );

  // Execute the query
  const querySnapshot = await getDocs(q);

  // Loop through the documents and delete each one
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
    console.log(`Deleted document with ID: ${doc.id}`);
  });
}
export async function updateBets(
  userID: string,
  bet: number,
  betno: number,
  multiplier: number,
  cashout: number,
  status: string
) {
  const q = query(
    collection(db, "bets"),
    where("phone", "==", userID),
    where("status", "==", "placed"),
    where("bet", "==", bet),
    where("betno", "==", betno)
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const docRef = doc.ref;

    // Update the amount field
    updateDoc(docRef, {
      cashout: Number(cashout.toFixed(2)),
      multiplier: Number(multiplier.toFixed(2)),
      status: status,
    })
      .then(() => {
        console.log("Document successfully updated!");
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      });
  });
}
export async function deleteDocumentById(id: string) {
  const q = query(collection(db, "withdraw"), where("id", "==", id));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const docRef = doc.ref;

    deleteDoc(docRef)
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
      });
  });
}
export const fetchhouseEdge = async () => {
  const userQuery = query(collection(db, "settings"));
  const userSnapshot = await getDocs(userQuery);
  if (!userSnapshot.empty) {
    const userData = userSnapshot.docs[0].data();

    return userData.houseEdge;
  }
};

// Usage
