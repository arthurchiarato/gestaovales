import React, { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoNome, setNovoNome] = useState("");

  const carregarUsuarios = async () => {
    const querySnapshot = await getDocs(collection(db, 'usuarios'));
    const lista = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsuarios(lista);
  };

  const adicionarUsuario = async () => {
    if (novoNome.trim() === '') return;
    await addDoc(collection(db, 'usuarios'), { nome: novoNome });
    setNovoNome('');
    carregarUsuarios(); // recarrega lista
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Usuários</h1>
      <ul>
        {usuarios.map(u => (
          <li key={u.id}>{u.nome}</li>
        ))}
      </ul>

      <input
        type="text"
        value={novoNome}
        onChange={(e) => setNovoNome(e.target.value)}
        placeholder="Novo nome"
      />
      <button onClick={adicionarUsuario}>Adicionar</button>
    </div>
  );
}

export default App;
