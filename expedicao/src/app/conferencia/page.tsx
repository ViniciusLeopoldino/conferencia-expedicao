'use client';

import { useState, useRef } from 'react';
import jsPDF from 'jspdf';

export default function Conferencia() {
  const [nfKey, setNfKey] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [volumes, setVolumes] = useState(0);
  const [bipados, setBipados] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [log, setLog] = useState<{ nf: string; volumes: number }[]>([]);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [novaNF, setNovaNF] = useState(false); // Controle de nova NF

  const nfInputRef = useRef<HTMLInputElement>(null);
  const etiquetaInputRef = useRef<HTMLInputElement>(null);

  // Função que move o foco para o próximo input automaticamente
  const handleNfKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNfKey(e.target.value);
    if (e.target.value.length === 44) { // Supondo que 44 seja o tamanho da chave NF
      etiquetaInputRef.current?.focus();
    }
  };

  // Conferência automática ao bipar etiqueta
  const handleEtiquetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtiqueta(e.target.value);
    if (e.target.value.length === 19) { // Considerando etiqueta com 19 caracteres
      bipar();
    }
  };

  const handleVolumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumes(Number(e.target.value));
  };

  // Função de conferência
  const bipar = () => {
    const nfNumero = nfKey.slice(25, 34); // Ajuste conforme necessário
    const etiquetaNumero = etiqueta.slice(4, 13); // Ajuste conforme necessário
  
    if (nfNumero === etiquetaNumero) {
      setMensagem('OK');
  
      // Evitar duplicações na contagem de bipados
      setBipados((prevBipados) => prevBipados + 1);
  
      // Atualizar o log somente após finalizar a contagem
      const existeLog = log.find((item) => item.nf === nfNumero);
      if (!existeLog) {
        setLog([...log, { nf: nfNumero, volumes: 1 }]); // Adicionar nova linha
      } else {
        setLog(
          log.map((item) =>
            item.nf === nfNumero
              ? { ...item, volumes: item.volumes + 1 } // Incrementar volumes
              : item
          )
        );
      }
    } else {
      setMensagem('Erro: Números diferentes!');
      const audio = new Audio('/erro.mp3');
      audio.play();
    }
  
    setEtiqueta(''); // Limpa o campo da etiqueta após bipar
  
    // Checar se todos os volumes foram bipados
    if (bipados + 1 >= volumes) {
      finalizar();
    }
  };
  
// Função para finalizar e perguntar ao usuário se deseja bipar outra NF
const finalizar = () => {
  setMensagem("Conferência finalizada! Deseja bipar outra NF?");
  // Lógica para perguntar se o usuário deseja bipar outra NF (exemplo de prompt):
  const continuar = window.confirm("Conferência finalizada! Deseja bipar outra NF?");
  if (continuar) {
    resetarConferencia(); // Função para resetar a conferência
  }
};

// Função para resetar a conferência e permitir começar outra NF
const resetarConferencia = () => {
  setNfKey('');
  setEtiqueta('');
  setVolumes(0);
  setBipados(0);
  setMensagem('');
};

  const iniciarNovaNF = () => {
    setNfKey('');
    setEtiqueta('');
    setVolumes(0);
    setBipados(0);
    setMensagem('');
    nfInputRef.current?.focus();
    setNovaNF(false);
  };

  // Função para gerar o PDF do relatório
  const gerarPDF = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = '/logo.png';
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 50, 20);
      doc.setFontSize(20);
      doc.text('Relatório de Conferência de Expedição', 20, 40);
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 50);
      
      let y = 60;
      const nfMap = new Map(); // Armazena a soma de volumes por NF
      log.forEach((item) => {
        if (nfMap.has(item.nf)) {
          nfMap.set(item.nf, nfMap.get(item.nf) + item.volumes);
        } else {
          nfMap.set(item.nf, item.volumes);
        }
      });

      nfMap.forEach((volumes, nf) => {
        doc.text(`Nota Fiscal: ${nf} | Quantidade de volumes: ${volumes}`, 20, y);
        y += 10;
      });

      doc.text('Assinatura: ____________________', 20, y + 10);
      doc.save('relatorio_conferencia.pdf');
    };
  };

  return (
    <div className="main-container">
      <div className="content">
        <h1 className="text-2xl font-bold text-center mb-4">Conferência de Expedição</h1>

        <div className="mb-4">
          <label className="block text-gray-700">Quantidade de Volumes:</label>
          <input
            type="number"
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleVolumesChange}
            value={volumes}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bipar Chave NF:</label>
          <input
            ref={nfInputRef}
            value={nfKey}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleNfKeyChange}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Bipar Etiqueta:</label>
          <input
            ref={etiquetaInputRef}
            value={etiqueta}
            className="mt-1 p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            onChange={handleEtiquetaChange}
          />
        </div>

        <p className={`mt-4 text-center ${mensagem === 'OK' ? 'text-green-500' : 'text-red-500'}`}>
          {mensagem}
        </p>

        {novaNF && (
          <div className="mt-4">
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold"
              onClick={iniciarNovaNF}
            >
              Bipar Nova NF
            </button>
          </div>
        )}

        <button
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold mt-4"
          onClick={gerarPDF}
        >
          Baixar PDF do Relatório
        </button>
      </div>
    </div>
  );
}
