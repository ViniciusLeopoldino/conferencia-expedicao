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
  const [novaNF, setNovaNF] = useState(false);

  const nfInputRef = useRef<HTMLInputElement>(null);
  const etiquetaInputRef = useRef<HTMLInputElement>(null);

  const handleNfKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNfKey(e.target.value);
    if (e.target.value.length === 44) {
      etiquetaInputRef.current?.focus();
    }
  };

  const handleEtiquetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtiqueta(e.target.value);
    if (e.target.value.length === 19) {
      bipar();
    }
  };

  const handleVolumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolumes(Number(e.target.value));
  };

  const bipar = () => {
    const nfNumero = nfKey.slice(25, 34);
    const etiquetaNumero = etiqueta.slice(4, 13);

    if (nfNumero === etiquetaNumero) {
      setMensagem('OK');
      setBipados((prevBipados) => prevBipados + 1);

      const existeLog = log.find((item) => item.nf === nfNumero);
      if (!existeLog) {
        setLog([...log, { nf: nfNumero, volumes: 1 }]);
      } else {
        setLog(
          log.map((item) =>
            item.nf === nfNumero
              ? { ...item, volumes: item.volumes + 1 }
              : item
          )
        );
      }
    } else {
      setMensagem('Erro: Números diferentes!');
      const audio = new Audio('/erro.mp3');
      audio.play();
    }

    setEtiqueta('');

    if (bipados + 1 >= volumes) {
      finalizar();
    }
  };

  const finalizar = () => {
    setMensagem('Conferência finalizada! Deseja bipar outra NF?');
    const continuar = window.confirm('Conferência finalizada! Deseja bipar outra NF?');
    if (continuar) {
      resetarConferencia();
    }
  };

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

  const gerarPDF = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = '/logo.png';
    logo.onload = () => {
      doc.addImage(logo, 'PNG', 20, 10, 60, 20);
      doc.setFontSize(20);
      doc.text('Relatório de Conferência de Expedição', 20, 40);
      doc.setFontSize(12);
      doc.text(`Data: ${new Date().toLocaleDateString()}`, 20, 50);

      let y = 60;
      const nfMap = new Map();
      log.forEach((item) => {
        if (nfMap.has(item.nf)) {
          nfMap.set(item.nf, nfMap.get(item.nf) + item.volumes);
        } else {
          nfMap.set(item.nf, item.volumes);
        }
      });

      nfMap.forEach((volumes, nf) => {
        doc.text(`Nota Fiscal: ${nf}    |    Quantidade de volumes: ${volumes}`, 20, y);
        y += 10;
      });

      doc.text('Nome: ____________________\n\nRG: ____________________', 20, y + 20);
      doc.save('relatorio_conferencia.pdf');
    };
  };

  return (
    <div id="main-container">
      <div id="content">
        <h1 id="title">Conferência de Expedição</h1>

        <div className="input-group">
          <label>Quantidade de Volumes:</label>
          <input
            type="number"
            onChange={handleVolumesChange}
            value={volumes}
          />
        </div>

        <div className="input-group">
          <label>Bipar Chave NF:</label>
          <input
            ref={nfInputRef}
            value={nfKey}
            onChange={handleNfKeyChange}
          />
        </div>

        <div className="input-group">
          <label>Bipar Etiqueta:</label>
          <input
            ref={etiquetaInputRef}
            value={etiqueta}
            onChange={handleEtiquetaChange}
          />
        </div>

        <p id="mensagem" className={mensagem === 'OK' ? 'sucesso' : 'erro'}>
          {mensagem}
        </p>

        {novaNF && (
          <div className="nova-nf">
            <button onClick={iniciarNovaNF}>Bipar Nova NF</button>
          </div>
        )}

        <button onClick={gerarPDF}>Baixar PDF do Relatório</button>
      </div>
    </div>
  );
}
