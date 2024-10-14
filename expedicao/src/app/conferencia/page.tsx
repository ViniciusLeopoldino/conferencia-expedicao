'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

export default function Conferencia() {
  const [nfKey, setNfKey] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [volumes, setVolumes] = useState(0);
  const [bipados, setBipados] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [log, setLog] = useState<{ nf: string; volumes: number }[]>([]);
  const [showRelatorio, setShowRelatorio] = useState(false);

  const handleNfKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNfKey(e.target.value);
  };

  const handleEtiquetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtiqueta(e.target.value);
  };

  const handleVolumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumes(Number(e.target.value));
  };

  const bipar = async () => {
    const nfNumero = nfKey.slice(25, 34);
    const etiquetaNumero = etiqueta.slice(4, 13);

    if (nfNumero === etiquetaNumero) {
      setMensagem('OK');
      setBipados(bipados + 1);
    } else {
      setMensagem('Erro: Números diferentes!');
      const audio = new Audio('/erro.mp3');
      audio.play();
    }

    try {
      await fetch('/api/relatorio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nf: nfNumero, volumes }),
      });
    } catch (error) {
      console.error('Erro ao salvar no banco de dados:', error);
    }

    setLog([...log, { nf: nfNumero, volumes }]);
  };

  const gerarPDF = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = '/logo.png'; // Altere para o caminho do seu logo
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 50, 20);

      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Conferência de Expedição', 20, 40);

      // Data
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 50);
      
      // Adicionando os itens do log
      doc.setFontSize(12);
      let y = 60;
      log.forEach((item) => {
        doc.text(`Nota Fiscal: ${item.nf} | Quantidade de volumes: ${item.volumes}`, 20, y);
        y += 10;
      });

      // Assinatura
      doc.text('Assinatura: ____________________', 20, y + 10);

      // Salvar PDF
      doc.save('relatorio_conferencia.pdf');
    };
  };

  return (
    <div className="main-container">
      <div className="content">
        <h1 className="text-2xl font-bold text-center mb-4">Conferência de Expedição</h1>

        <div className="mb-4">
          <label className="block text-gray-700">Número de Volumes:</label>
          <input
            type="number"
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleVolumesChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bipar Chave NF:</label>
          <input
            value={nfKey}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleNfKeyChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bipar Etiqueta:</label>
          <input
            value={etiqueta}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleEtiquetaChange}
          />
        </div>

        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold mb-4"
          onClick={bipar}
        >
          Conferir
        </button>

        <p className={`mt-4 text-center ${mensagem === 'OK' ? 'text-green-500' : 'text-red-500'}`}>
          {mensagem}
        </p>

        <p className="text-gray-700 mt-2">
          Volumes bipados: {bipados}/{volumes}
        </p>

        <h2 className="text-xl font-bold text-center mt-6">Relatório</h2>
        <ul className="list-disc list-inside mt-2">
          {log.map((item, index) => (
            <li key={index} className="text-gray-700">
              Nota Fiscal: {item.nf} | Quantidade de volumes: {item.volumes}
            </li>
          ))}
        </ul>

        <button
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold mt-4"
          onClick={gerarPDF}
        >
          Baixar PDF do Relatório
        </button>

        {showRelatorio && (
          <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
            <h3 className="text-lg font-bold">Relatório Completo</h3>
            <ul className="list-disc list-inside mt-2">
              {log.map((item, index) => (
                <li key={index} className="text-gray-700">
                  Nota Fiscal: {item.nf} | Quantidade de volumes: {item.volumes}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-gray-600">Data: {new Date().toLocaleDateString()}</p>
            <p className="mt-2 text-gray-600">Assinatura: ____________________</p>
          </div>
        )}
      </div>
    </div>
  );
}


