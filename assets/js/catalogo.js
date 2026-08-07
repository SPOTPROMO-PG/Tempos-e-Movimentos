/**
 * Catálogo de Setor -> Lojas assignadas
 *
 * Amostra TEMPORÁRIA com 20 setores (de ~1.066 no total), escolhidos
 * aleatoriamente. Cobre os promotores que já estão respondendo a pesquisa
 * hoje. Quando o restante dos ~1000 promotores for liberado, gerar este
 * arquivo novamente a partir de:
 *   "CATALOGO ASSIGNACAO REGULAR SPOT - AGOSTO'26.xlsx" (aba ASSIGNACAO REGULAR)
 * agrupando por SETOR PROMOTOR -> lista de lojas (ID LOJA, CANAL, REDE,
 * NOME DA LOJA, CIDADE, ESTADO), removendo duplicidade por loja.
 */

const CATALOGO = [
  {
    "setor": "PR03",
    "lojas": [
      {
        "id": "0018a00002GR1dWAAT",
        "canal": "DPP",
        "rede": "SPACEFARMA DISTRIBUIDORA DE MEDICAMENTOS EIRELI",
        "nome": "CALLFARMA AVENIDA VICTOR FERREIRA DO AMARAL 2872",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Vx5WSIAZ",
        "canal": "DPP",
        "rede": "SPACEFARMA DISTRIBUIDORA DE MEDICAMENTOS EIRELI",
        "nome": "CALLFARMA PIRAQUARA",
        "cidade": "PIRAQUARA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9JVSQA2",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DP BAIRRO UBERABA",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0018a00001x732aAAA",
        "canal": "DPP",
        "rede": "MAEOKA LTDA",
        "nome": "FARMACIAS DESCONTAO GETULIO VARGAS 657",
        "cidade": "PIRAQUARA",
        "estado": "PR"
      },
      {
        "id": "0018a00002OPtjIAAT",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "FARMACIAS UNIPRECO IRAI,916",
        "cidade": "PINHAIS",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HtrQAE",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 194 BAIRRO ALTO",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HtcQAE",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 215 PINHAIS IV",
        "cidade": "PINHAIS",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HtSQAU",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 234 CENTENARIO",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HvPQAU",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 285 FAZENDINHA TERMINAL",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0018a00001x731UAAQ",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI COMENDADOR FRANCO 2656",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0018a00002OPtogAAD",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI PROFESSOR NIVALDO BRAGA 912",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Z7EnwIAF",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL PINHAIS IRAI",
        "cidade": "PINHAIS",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IVrQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CT CRISTO REI A  (NOBRE P)",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IZaQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIASIL NOSSA SENHORA DE LOURDES",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0018a00001x736MAAQ",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "REDE UNIPRECO STRAPASSON RUA JOSE DE OLIVEIRA FRANCO",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9LFgQAM",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "UNIPRECO ABEL 2930",
        "cidade": "COLOMBO",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9K6tQAE",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "UNIPRECO ALBERICO FLORES BUENO 424",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9LFeQAM",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "UNIPRECO FAGUNDES VARELA 1487",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR117",
    "lojas": [
      {
        "id": "0014W00002e9Hz9QAE",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 21 NILO PECANHA",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR275",
    "lojas": [
      {
        "id": "0018a00002GR1bkAAD",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO CURITIBA BOA VISTA",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0018a00001x734PAAQ",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR VAREJO AV PARANA 1250",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR90",
    "lojas": [
      {
        "id": "0014W00002e9HWdQAM",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO CURITIBA FAZENDINHA",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HyXQAU",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 50 SANTA QUITERIA",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PROJ-MAIS-PR10",
    "lojas": [
      {
        "id": "0014W00002e9HzPQAU",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 3 SANTA FELICIDADE",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HxJQAU",
        "canal": "NMR",
        "rede": "MUFFATO VAREJO",
        "nome": "MUFFATO VAREJO  1096  SANTA FELICIDADE",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PROJ-MAIS-SC19",
    "lojas": [
      {
        "id": "0018a00002GR1bHAAT",
        "canal": "C&C",
        "rede": "BRASIL ATACADISTA",
        "nome": "BRASIL ATACADISTA PALHOCA ROD BR 101",
        "cidade": "PALHOCA",
        "estado": "SC"
      },
      {
        "id": "001Ho00001QiwkuIAB",
        "canal": "NMR",
        "rede": "PRADO SUPERMERCADO LTDA",
        "nome": "PRADO PAGANI",
        "cidade": "PALHOCA",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "PROJ-MAIS-SPI44",
    "lojas": [
      {
        "id": "0014W00002e9HWSQA2",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO ITU",
        "cidade": "ITU",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LMMQA2",
        "canal": "C&C",
        "rede": "TENDA",
        "nome": "TENDA ITU",
        "cidade": "ITU",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SC105",
    "lojas": [
      {
        "id": "0014W00002e9HyZQAU",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 48 JOINVILLE SC",
        "cidade": "JOINVILLE",
        "estado": "SC"
      },
      {
        "id": "0018a00001x735AAAQ",
        "canal": "C&C",
        "rede": "HIPER MAIS",
        "nome": "HIPERMAIS FATIMA",
        "cidade": "JOINVILLE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC146",
    "lojas": [
      {
        "id": "0018a00002cTPNiAAO",
        "canal": "NMR",
        "rede": "BADOTTI E CIA LTDA",
        "nome": "BADOTTI E CIA LTDA AVENIDA BRASIL 295",
        "cidade": "XANXERE",
        "estado": "SC"
      },
      {
        "id": "0018a00001x735WAAQ",
        "canal": "NMR",
        "rede": "BRASAO OESTE LTDA",
        "nome": "BRASAO SUPERMERCADOS SA R ANTONIO V GIORDANI 164",
        "cidade": "XANXERE",
        "estado": "SC"
      },
      {
        "id": "0018a00001x730pAAA",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 799 XAN/1",
        "cidade": "XANXERE",
        "estado": "SC"
      },
      {
        "id": "0018a00002MhIdWAAV",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA XANXERE A (VICTOR KONDER)  (HIBRIDO P)",
        "cidade": "XANXERE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC180",
    "lojas": [
      {
        "id": "001Ho00001Z3pH5IAJ",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "DROGARIA SAO JOAO  RUA DONA FRANCISCA 3125  SAGUACU",
        "cidade": "JOINVILLE",
        "estado": "SC"
      },
      {
        "id": "0018a00001s6N7RAAU",
        "canal": "C&C",
        "rede": "KOCH",
        "nome": "KOMPRAO 45 JOINVILLE",
        "cidade": "JOINVILLE",
        "estado": "SC"
      },
      {
        "id": "0018a00002eHdBzAAK",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO FARMACIAS RUA OLAVO BILAC 368",
        "cidade": "JOINVILLE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC281",
    "lojas": [
      {
        "id": "001Ho00001Z6S5WIAV",
        "canal": "C&C",
        "rede": "KOCH",
        "nome": "KOMPRAO 90 SAO JOSE FORQUILHAS",
        "cidade": "SAO JOSE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SPI11",
    "lojas": [
      {
        "id": "0018a00001x739EAAQ",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL ARMANDO DE SALES OLIVEIRA 285",
        "cidade": "PORTO FELIZ",
        "estado": "SPI"
      },
      {
        "id": "0018a00002MdjjhAAB",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL EUGENIO MOTTA BOITUVA",
        "cidade": "BOITUVA",
        "estado": "SPI"
      },
      {
        "id": "0018a00001tq3nrAAA",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL GOMIDE PEIXOTO ITAPETININGA",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0018a00001tq3nqAAA",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL PADRE ANTONIO ITAPETININGA",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0018a00001tq3ntAAA",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL POMPEO REALI TATUI",
        "cidade": "TATUI",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Ii9QAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL ITAPETININGA 1  (POPULAR G)",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IfoQAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL ITAPETININGA 2  (HIBRIDO P)",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IQnQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL ITAPETININGA 5  5065 (HIBRIDA P)",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Ii3QAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL TATUI 1  (HIBRIDO M)",
        "cidade": "TATUI",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IQaQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL TATUI 2  (NOBRE G)",
        "cidade": "TATUI",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Iv8QAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP CIDADE DE TATUI",
        "cidade": "TATUI",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IueQAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP ITAPETININGA",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Ip0QAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP ITAPETININGA II",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0018a00001jxkMsAAI",
        "canal": "GMR",
        "rede": "GPA",
        "nome": "EX ITAPETININGA  LOJA 2080",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IcOQAU",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA PORTO FELIZ A  (NOBRE PP)",
        "cidade": "PORTO FELIZ",
        "estado": "SPI"
      },
      {
        "id": "0018a000026L7CqAAK",
        "canal": "NMR",
        "rede": "REDE SAO ROQUE",
        "nome": "SAO ROQUE TATUI",
        "cidade": "TATUI",
        "estado": "SPI"
      },
      {
        "id": "0018a00001jxkAaAAI",
        "canal": "C&C",
        "rede": "SPANI",
        "nome": "SPANI ITAPETININGA",
        "cidade": "ITAPETININGA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI127",
    "lojas": [
      {
        "id": "0018a00001x7mJVAAY",
        "canal": "C&C",
        "rede": "ASSAI",
        "nome": "ASSAI SOROCABA CAMPOLIM 263",
        "cidade": "SOROCABA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LOYQA2",
        "canal": "LASA",
        "rede": "LASA",
        "nome": "LASA SOROCABA SHOPPING IGUATEMI",
        "cidade": "VOTORANTIM",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI439",
    "lojas": [
      {
        "id": "0014W00002e9JetQAE",
        "canal": "GMR",
        "rede": "GPA",
        "nome": "EX OLIMPIA  LOJA 5740",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LJIQA2",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI OLIMPIA LOJA 04",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LJGQA2",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI OLIMPIA LOJA 08",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0018a000026L7CbAAK",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI OLIMPIA LOJA 15",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI491",
    "lojas": [
      {
        "id": "0014W00002e9IH9QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CAJAMAR 1  (HIBRIDO M)",
        "cidade": "CAJAMAR",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IqwQAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP CAJAMAR",
        "cidade": "CAJAMAR",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LHPQA2",
        "canal": "NMR",
        "rede": "SONDA",
        "nome": "SONDA CAJAMAR",
        "cidade": "CAJAMAR",
        "estado": "SPI"
      },
      {
        "id": "0018a00001x73AcAAI",
        "canal": "C&C",
        "rede": "SPANI",
        "nome": "SPANI CAJAMAR",
        "cidade": "CAJAMAR",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI511",
    "lojas": [
      {
        "id": "0014W00002e9J8GQAU",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL COSMOPOLIS",
        "cidade": "COSMOPOLIS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IzcQAE",
        "canal": "NMR",
        "rede": "SUPER PAGUE MENOS",
        "nome": "PAGUE MENOS ARTUR NOGUEIRA L21",
        "cidade": "ARTUR NOGUEIRA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9JOTQA2",
        "canal": "NMR",
        "rede": "SAO VICENTE",
        "nome": "SAO VICENTE LOJA 10",
        "cidade": "COSMOPOLIS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI595",
    "lojas": [
      {
        "id": "0018a000022TUVxAAO",
        "canal": "NMR",
        "rede": "REDE SUPERMERCADO ASP",
        "nome": "ENXUTO JD AURELIA",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0018a00002eGpXYAA0",
        "canal": "C&C",
        "rede": "SPANI",
        "nome": "SPANI OSWALDO OSCAR  CAMPINAS",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI596",
    "lojas": [
      {
        "id": "0014W00002e9I2oQAE",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO CARAPICUIBA",
        "cidade": "CARAPICUIBA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI620",
    "lojas": [
      {
        "id": "0014W00002e9J9GQAU",
        "canal": "NMR",
        "rede": "CONFIANCA",
        "nome": "CONFIANCA NACOES",
        "cidade": "BAURU",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI68",
    "lojas": [
      {
        "id": "0018a000026L7D2AAK",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL OLIMPIA",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LJKQA2",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI OLIMPIA LOJA 01",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0018a000026L7CdAAK",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI OLIMPIA LOJA 16",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LJJQA2",
        "canal": "NMR",
        "rede": "SUPERMERCADO IQUEGAMI",
        "nome": "IQUEGAMI SEVERINIA LOJA 06",
        "cidade": "SEVERINIA",
        "estado": "SPI"
      },
      {
        "id": "0018a000022TUVrAAO",
        "canal": "NMR",
        "rede": "LOPES",
        "nome": "LOPES OLIMPIA",
        "cidade": "OLIMPIA",
        "estado": "SPI"
      }
    ]
  }
];
