/**
 * Catálogo Setor -> Promotor -> Lojas assignadas.
 *
 * Gerado a partir de dois arquivos (mantidos fora do repositório):
 *   - "Nomes_Tempos&Movimentos.xlsx"   -> quem responde, setor e canal
 *   - "CATALOGO ASSIGNACAO REGULAR..." -> as lojas de cada setor
 *
 * As lojas são filtradas pelo(s) canal(is) que o promotor cobre: a base de
 * assignação lista todas as lojas do setor, mas o promotor só atende as do
 * canal dele. Sem esse filtro apareceriam 230 lojas em vez de 148, com 82
 * que não são dele.
 *
 * `promotor` e `executivo` vêm junto para serem gravados na resposta sem
 * precisar perguntar nada em tela.
 */

const CATALOGO = [
  {
    "setor": "PR107",
    "promotor": "DANIELA RODRIGUES DA CRUZ",
    "executivo": "DANIELA",
    "canais": [
      "GMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9JMkQAM",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR HIPER LONDRINA",
        "cidade": "LONDRINA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR151",
    "promotor": "LUCIANE APARECIDA VESSELOVITZ",
    "executivo": "DANIELA",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0018a00001x732ZAAQ",
        "canal": "DPP",
        "rede": "MAEOKA LTDA",
        "nome": "FARMACIAS DESCONTAO QUINZE DE NOVEMBRO 2152",
        "cidade": "SAO JOSE DOS PINHAIS",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9KCuQAM",
        "canal": "DPP",
        "rede": "MORIFARMA",
        "nome": "MORIFARMA IZABEL REDENTORA",
        "cidade": "SAO JOSE DOS PINHAIS",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9LFfQAM",
        "canal": "DPP",
        "rede": "REDE UNIPRECO STRAPASSON",
        "nome": "UNIPRECO BARAO DO CERRO AZUL 1235",
        "cidade": "SAO JOSE DOS PINHAIS",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR18",
    "promotor": "FRANCIELI LUANI GOMES",
    "executivo": "DANIELA",
    "canais": [
      "LASA"
    ],
    "lojas": [
      {
        "id": "0014W00002e9LNmQAM",
        "canal": "LASA",
        "rede": "LASA",
        "nome": "LASA SHC LONDRINA NORTE",
        "cidade": "LONDRINA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR208",
    "promotor": "KAUA HENRIQUE SANTOS MORENO",
    "executivo": "DANIELA",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9Kk5QAE",
        "canal": "C&C",
        "rede": "ASSAI",
        "nome": "ASSAI CURITIBA JK 195",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR221",
    "promotor": "ANGELA CRISTINA BARBOZA LIMA",
    "executivo": "DANIELA",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0014W00002e9KNAQA2",
        "canal": "HFS",
        "rede": "REDE BOA COMPRA",
        "nome": "BOA COMPRA AV CASTRO ALVES 2539",
        "cidade": "ROLANDIA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9KNpQAM",
        "canal": "HFS",
        "rede": "REDE BOA COMPRA",
        "nome": "BOA COMPRA R REINALDO MASSI",
        "cidade": "ROLANDIA",
        "estado": "PR"
      },
      {
        "id": "0018a00002cTPMaAAO",
        "canal": "HFS",
        "rede": "REDE BOA COMPRA",
        "nome": "REDE BOA COMPRA AVENIDA IGUACU 1001",
        "cidade": "ROLANDIA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR256",
    "promotor": "ANDRESSA STEFANI DA SILVA",
    "executivo": "DANIELA",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HxCQAU",
        "canal": "HFS",
        "rede": "COML DE SECOS E MOLHADOS CONSALTER LTDA",
        "nome": "COML DE SECOS E MOLHADOS CONSALTER LTDA AV FELIPE WANDSCHEER 1",
        "cidade": "FOZ DO IGUACU",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9L0BQAU",
        "canal": "HFS",
        "rede": "ITALO SUPERMERCADOS 1",
        "nome": "ITALO REPULICA ARGENTINA",
        "cidade": "FOZ DO IGUACU",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR275",
    "promotor": "KAUANY DANIELLI MAYNARD DE OLIVEIRA",
    "executivo": "DANIELA",
    "canais": [
      "GMR"
    ],
    "lojas": [
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
    "setor": "PR38",
    "promotor": "GELSON APARECIDO ALVES SANT ANA",
    "executivo": "DANIELA",
    "canais": [
      "LASA"
    ],
    "lojas": [
      {
        "id": "001Ho00001gVOgKIAW",
        "canal": "LASA",
        "rede": "LASA",
        "nome": "Lasa Mandacaru",
        "cidade": "MARINGA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR49",
    "promotor": "KEILA DE ANDRADE MARTINS",
    "executivo": "DANIELA",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HyeQAE",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 43 ALMIRANTE TAMANDARE",
        "cidade": "ALMIRANTE TAMANDARE",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Z6EqbIAF",
        "canal": "NMR",
        "rede": "SUPERMERCADO FESTIVAL",
        "nome": "FESTVAL JUVEVE 45",
        "cidade": "CURITIBA",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HwjQAE",
        "canal": "NMR",
        "rede": "SUPERMERCADO FESTIVAL",
        "nome": "FESTVAL MATHEUS LEME",
        "cidade": "CURITIBA",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "PR69",
    "promotor": "LUCINEIA DE FATIMAS ALVES",
    "executivo": "DANIELA",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0018a00002cSe4cAAC",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGA RAIA SALGADO FILHO",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Z3pGYIAZ",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "DROGARIA SAO JOAO  AVENIDA TANCREDO NEVES 2119  PIONEIROS CATARINENSES",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Z3pGGIAZ",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "DROGARIA SAO JOAO  RUA SANTOS DUMONT 2309  CENTRO",
        "cidade": "TOLEDO",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9KGsQAM",
        "canal": "DPP",
        "rede": "M A BORGES COMERCIO DE MEDICAMENTOS LTDA",
        "nome": "FARMA ESTRELA AV BRASIL 7538",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0018a00001x7lRaAAI",
        "canal": "DPP",
        "rede": "M A BORGES COMERCIO DE MEDICAMENTOS LTDA",
        "nome": "FARMACIA ESTRELA CASCAVEL",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9KGwQAM",
        "canal": "DPP",
        "rede": "M A BORGES COMERCIO DE MEDICAMENTOS LTDA",
        "nome": "FARMACIA ESTRELA RUA PARANA 2881",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9KGxQAM",
        "canal": "DPP",
        "rede": "M A BORGES COMERCIO DE MEDICAMENTOS LTDA",
        "nome": "FARMACIA ESTRELA RUA PRESIDENTE JUSCELINO KUBITSCHEK 833",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HuRQAU",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 138 CASCAVEL CENTRO 24 HRS",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HuOQAU",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 142 TOLEDO CENTRO MATRIZ",
        "cidade": "TOLEDO",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HujQAE",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "NISSEI 296 TOLEDO",
        "cidade": "TOLEDO",
        "estado": "PR"
      },
      {
        "id": "001Ho00001Z7Eo0IAF",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL CASCAVEL MINAS GERAIS",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0018a00001x730nAAA",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 581 TLD/2",
        "cidade": "TOLEDO",
        "estado": "PR"
      },
      {
        "id": "0018a00002cTPaNAAW",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL RUA BARAO DO RIO BRANCO 1540",
        "cidade": "TOLEDO",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9HZGQA2",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL RUA PARANA",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IY7QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CASCAVEL A  (HIBRIDO M)",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IWVQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CASCAVEL B  (NOBRE M)",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IPPQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CASCAVEL C  (NOBRE G)",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IPDQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CASCAVEL D  (NOBRE M)",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IJGQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CASCAVEL E  (NOBRE P)",
        "cidade": "CASCAVEL",
        "estado": "PR"
      },
      {
        "id": "0014W00002e9IP1QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA TOLEDO B  (NOBRE M)",
        "cidade": "TOLEDO",
        "estado": "PR"
      }
    ]
  },
  {
    "setor": "RS12",
    "promotor": "KATIA EUFRASE SILVA",
    "executivo": "ANNY",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0014W00002e9Hf1QAE",
        "canal": "HFS",
        "rede": "COOPERATIVA SANTA CLARA LTDA",
        "nome": "SANTA CLARA CARLOS BARBOSA",
        "cidade": "CARLOS BARBOSA",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9Hf0QAE",
        "canal": "HFS",
        "rede": "COOPERATIVA SANTA CLARA LTDA",
        "nome": "SANTA CLARA PONTE SECA",
        "cidade": "CARLOS BARBOSA",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS137",
    "promotor": "JULIA EDUARDA MARTINS",
    "executivo": "ANNY",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HeeQAE",
        "canal": "HFS",
        "rede": "COOP AGRIC CAIRU LTDA",
        "nome": "CAIRU GARIBALDI",
        "cidade": "GARIBALDI",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS148",
    "promotor": "ARIEL WEBER",
    "executivo": "ANNY",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0018a00002cTPSPAA4",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "DROGARIA SAO JOAO RUA SANTANA 1340",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9KcAQAU",
        "canal": "DPP",
        "rede": "DROGARIA PAGUE MENOS",
        "nome": "PAGUE MENOS 357 POA MENINO DEUS",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9KUCQA2",
        "canal": "DPP",
        "rede": "DROGARIA PAGUE MENOS",
        "nome": "PAGUE MENOS POA BAGE",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HagQAE",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL 308 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HaEQAU",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL 330 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HZRQA2",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL 378 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HYxQAM",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL 733 PORTO ALEGRE",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HcTQAU",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 139 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HaLQAU",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 322 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HZxQAM",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 343 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0018a00001x731lAAA",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 783 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HdbQAE",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 9 POA",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0018a00002aaTBGAA2",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO 102 PORTO ALEGRE",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0018a00002aaTBVAA2",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO 103 PORTO ALEGRE",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0018a00002aaTBUAA2",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO 107 PORTO ALEGRE",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "001Ho00001XTqzVIAT",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO POA 1200",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HfnQAE",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO PORTO ALEGRE 33",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      },
      {
        "id": "0018a00001x731zAAA",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO PORTO ALEGRE 91",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS150",
    "promotor": "BRUNA JUVENCIO",
    "executivo": "ANNY",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HYaQAM",
        "canal": "NMR",
        "rede": "CIA ZAFFARI BRASIL",
        "nome": "ZAFFARI 22",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS177",
    "promotor": "NESTOR JORGE",
    "executivo": "ANNY",
    "canais": [
      "GMR"
    ],
    "lojas": [
      {
        "id": "0018a00002HwkoIAAR",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR POA CRISTAL",
        "cidade": "PORTO ALEGRE",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS185",
    "promotor": "ANTÔNIO DOS SANTOS",
    "executivo": "ANNY",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0018a00002cQD2MAAW",
        "canal": "C&C",
        "rede": "COMERCIAL ZAFFARI",
        "nome": "STOK CENTER TORRES",
        "cidade": "TORRES",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS196",
    "promotor": "MURIELE ONGARATTO KINGESK",
    "executivo": "ANNY",
    "canais": [
      "GMR"
    ],
    "lojas": [
      {
        "id": "0018a00002HwkoOAAR",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR PELOTAS",
        "cidade": "PELOTAS",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS258",
    "promotor": "ISADORA BARBOSA",
    "executivo": "ANNY",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0018a00002GR1aAAAT",
        "canal": "NMR",
        "rede": "UNIDASUL VAREJO",
        "nome": "UNIDASUL RODOVIA RS 407 2575",
        "cidade": "XANGRI-LA",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "RS60",
    "promotor": "JOSSANE DE FREITAS MELO",
    "executivo": "ANNY",
    "canais": [
      "C&C",
      "DPP"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HWaQAM",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO BAGE",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0018a00002cTPaSAAW",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL AVENIDA TUPY SILVEIRA 2399",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9Ha3QAE",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 346 BG/4",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9Hb0QAE",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 488 BG/3",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HdpQAE",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 51 BG/1",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HiRQAU",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO BAGE 2",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HgsQAE",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO BAGE 3",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HgpQAE",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO BAGE 4",
        "cidade": "BAGE",
        "estado": "RS"
      },
      {
        "id": "0014W00002e9HgoQAE",
        "canal": "DPP",
        "rede": "DROGARIA SAO JOAO",
        "nome": "SAO JOAO BAGE 5",
        "cidade": "BAGE",
        "estado": "RS"
      }
    ]
  },
  {
    "setor": "SC113",
    "promotor": "SUZANA GOMES DE ASSIS SOUZA",
    "executivo": "ANNY",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HrfQAE",
        "canal": "C&C",
        "rede": "BRASIL ATACADISTA",
        "nome": "BRASIL ATACADISTA INGLESES",
        "cidade": "FLORIANOPOLIS",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC167",
    "promotor": "LUIS CLAUDIO SANTOS DOS SANTOS",
    "executivo": "ANNY",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HbYQAU",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL FILIAL 449 MPR",
        "cidade": "ITAPEMA",
        "estado": "SC"
      },
      {
        "id": "0018a00002cTPamAAG",
        "canal": "DPP",
        "rede": "PANVEL",
        "nome": "PANVEL RUA 278 526",
        "cidade": "ITAPEMA",
        "estado": "SC"
      },
      {
        "id": "0014W00002e9IMQQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA ITAPEMA D  4886 (NOBRE P)",
        "cidade": "ITAPEMA",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC209",
    "promotor": "LUIS VINICIUS SILVA COSTA",
    "executivo": "DANIELA",
    "canais": [
      "CLUB"
    ],
    "lojas": [
      {
        "id": "0014W00002e9LYyQAM",
        "canal": "CLUB",
        "rede": "SAMS CLUB",
        "nome": "SAMS CLUB BLUMENAU",
        "cidade": "BLUMENAU",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC21",
    "promotor": "ANA KAROLYNE PEDROSO GELBARI",
    "executivo": "ANNY",
    "canais": [
      "GMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HXFQA2",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR CAMBORIU",
        "cidade": "BALNEARIO CAMBORIU",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC223",
    "promotor": "JOÃO VIOTOR DA SILVA CARDOSO",
    "executivo": "ANNY",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0018a00002eFgnEAAS",
        "canal": "C&C",
        "rede": "KOCH",
        "nome": "KOMPRAO 79 PALHOCA",
        "cidade": "PALHOCA",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC241",
    "promotor": "ARIANA SILVA",
    "executivo": "ANNY",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0018a00002eFgmuAAC",
        "canal": "HFS",
        "rede": "PRADO SUPERMERCADO LTDA",
        "nome": "PRADO PEDRO DEMORO",
        "cidade": "ESTREITO",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC29",
    "promotor": "SAMANTA SILVA NUNES",
    "executivo": "ANNY",
    "canais": [
      "HFS"
    ],
    "lojas": [
      {
        "id": "0018a00002aaTBAAA2",
        "canal": "HFS",
        "rede": "HIPER SELECT SUPERMERCADOS LTDA",
        "nome": "HIPER BOM MORRO DAS PEDRAS",
        "cidade": "FLORIANOPOLIS",
        "estado": "SC"
      },
      {
        "id": "0018a00002eFgmpAAC",
        "canal": "HFS",
        "rede": "HIPER SELECT SUPERMERCADOS LTDA",
        "nome": "HIPER SELECT GONZAGA",
        "cidade": "FLORIANOPOLIS",
        "estado": "SC"
      },
      {
        "id": "0014W00002e9L6NQAU",
        "canal": "HFS",
        "rede": "HIPER SELECT SUPERMERCADOS LTDA",
        "nome": "MERCADO FELIPE ROYER PEQUENO PRINCIPE",
        "cidade": "FLORIANOPOLIS",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC31",
    "promotor": "ADRIANA RRODRIGUES",
    "executivo": "ANNY",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HpuQAE",
        "canal": "NMR",
        "rede": "GIASSI",
        "nome": "GIASSI 12 SAO JOSE AREIAS",
        "cidade": "SAO JOSE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC33",
    "promotor": "FRANCIELA RITA COSTA",
    "executivo": "DANIELA",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HqQQAU",
        "canal": "NMR",
        "rede": "ANGELONI",
        "nome": "ANGELONI 21 JOINVILLE JOAO COLIN",
        "cidade": "JOINVILLE",
        "estado": "SC"
      },
      {
        "id": "0014W00002e9HyWQAU",
        "canal": "NMR",
        "rede": "CONDOR",
        "nome": "CONDOR 51 JOINVILLE AMERICA",
        "cidade": "JOINVILLE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC34",
    "promotor": "YASMIM MANGER MARQUES",
    "executivo": "ANNY",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9HpwQAE",
        "canal": "NMR",
        "rede": "GIASSI",
        "nome": "GIASSI 10 PALHOCA",
        "cidade": "PALHOCA",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC63",
    "promotor": "CAMIOLA PEREIRA DA SILVA",
    "executivo": "ANNY",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0014W00002e9IcJQAU",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CRICIUMA A  (HIBRIDO M)",
        "cidade": "CRICIUMA",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SC71",
    "promotor": "AYLLA GABRIEL HISSI",
    "executivo": "DANIELA",
    "canais": [
      "CLUB"
    ],
    "lojas": [
      {
        "id": "0014W00002e9LYxQAM",
        "canal": "CLUB",
        "rede": "SAMS CLUB",
        "nome": "SAMS CLUB JOINVILLE",
        "cidade": "JOINVILLE",
        "estado": "SC"
      }
    ]
  },
  {
    "setor": "SPI02",
    "promotor": "ELAINE",
    "executivo": "KARINA",
    "canais": [
      "DPP"
    ],
    "lojas": [
      {
        "id": "0014W00002e9J6bQAE",
        "canal": "DPP",
        "rede": "DROGAL",
        "nome": "DROGAL CAMPINAS AV BADEN POWELL",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IifQAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP BARAO GERALDO 1  (NOBRE P)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IKdQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP BARAO GERALDO 2  (NOBRE M)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IM0QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP JARDIM PROENCA 1  (NOBRE G)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IGUQA2",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP JD MADALENA 1  (NOBRE M)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IE1QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP JD NOVA EUROPA 1  (NOBRE M)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Ii5QAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP JD OLIVEIRAS 1  (HIBRIDO M)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IgeQAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP PONTE PRETA 1  (HIBRIDO M)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IV1QAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGASIL CP SWIFT 1  (HIBRIDO G)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0018a00001x738XAAQ",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP VILA JOAQUIM INACIO",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9KTuQAM",
        "canal": "DPP",
        "rede": "DROGARIA PAGUE MENOS",
        "nome": "FARMACIAS PAGUE MENOS VILA MARIETA",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IYwQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CP BARAO GERALDO A  (NOBRE G)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IMjQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA CP JD NOVA EUROPA A  (NOBRE G)",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI11",
    "promotor": "EVERTON",
    "executivo": "KARINA",
    "canais": [
      "DPP"
    ],
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
        "id": "0014W00002e9IcOQAU",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA PORTO FELIZ A  (NOBRE PP)",
        "cidade": "PORTO FELIZ",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI187",
    "promotor": "AMANDA",
    "executivo": "KARINA",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9Iz5QAE",
        "canal": "NMR",
        "rede": "REDE COVABRA",
        "nome": "COVABRA DUNLOP L2",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9JQ8QAM",
        "canal": "NMR",
        "rede": "SAVEGNAGO",
        "nome": "SAVEGNAGO CAMPINAS BOTAFOGO LJ44",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9JTFQA2",
        "canal": "NMR",
        "rede": "SAVEGNAGO",
        "nome": "SAVEGNAGO CAMPINAS CENTRO LJ43",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI193",
    "promotor": "LAIZ DE SOUZA LIMA",
    "executivo": "GILSON",
    "canais": [
      "GMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9JMNQA2",
        "canal": "GMR",
        "rede": "CARREFOUR C&C",
        "nome": "CARREFOUR HIPER SJRP SHOPPING",
        "cidade": "SAO JOSE DO RIO PRETO",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI203",
    "promotor": "ROUSIANE FERREIRA NUNES",
    "executivo": "GILSON",
    "canais": [
      "CLUB",
      "NMR"
    ],
    "lojas": [
      {
        "id": "0018a00001x73B8AAI",
        "canal": "NMR",
        "rede": "SUPER PAGUE MENOS",
        "nome": "PAGUE MENOS AV DONA FRANCISCA 300",
        "cidade": "PIRACICABA",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LZlQAM",
        "canal": "CLUB",
        "rede": "SAMS CLUB",
        "nome": "SAMS CLUB PIRACICABA",
        "cidade": "PIRACICABA",
        "estado": "SPI"
      },
      {
        "id": "0018a00001s6N72AAE",
        "canal": "NMR",
        "rede": "SAVEGNAGO",
        "nome": "SAVEGNAGO LJ 51 PIRACICABA INDEPENDENCIA",
        "cidade": "PIRACICABA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI234",
    "promotor": "MARIA",
    "executivo": "KARINA",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0018a00002cTPXTAA4",
        "canal": "NMR",
        "rede": "SAVEGNAGO",
        "nome": "SAVEGNAGO AV JORGE TIBIRICA 139",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      },
      {
        "id": "0018a00002cTPQdAAO",
        "canal": "NMR",
        "rede": "SAVEGNAGO",
        "nome": "SAVEGNAGO AV PADRE ALMEIDA GARRET 1112",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI263",
    "promotor": "VANESSA",
    "executivo": "KARINA",
    "canais": [
      "PERFUMARIA"
    ],
    "lojas": [
      {
        "id": "0018a00002TnB3wAAF",
        "canal": "PERFUMARIA",
        "rede": "GEO COSMETICOS",
        "nome": "GEOCOSMETICOS  ITAPEVI",
        "cidade": "ITAPEVI",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI273",
    "promotor": "B RUNA LEME SILVA",
    "executivo": "GILSON",
    "canais": [
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9J9SQAU",
        "canal": "NMR",
        "rede": "CONFIANCA",
        "nome": "CONFIANCA MAX",
        "cidade": "BAURU",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI282",
    "promotor": "LUIS HENRIQUE FERNANDES DE OLIVEIRA",
    "executivo": "GILSON",
    "canais": [
      "LASA",
      "NMR"
    ],
    "lojas": [
      {
        "id": "0014W00002e9JNoQAM",
        "canal": "NMR",
        "rede": "CASA AVENIDA",
        "nome": "CASA AVENIDA LOJA 18",
        "cidade": "PRESIDENTE PRUDENTE",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9LRRQA2",
        "canal": "LASA",
        "rede": "LASA",
        "nome": "LASA SHC AMERICANAS PRE PRUDENTE",
        "cidade": "PRESIDENTE PRUDENTE",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Hy5QAE",
        "canal": "NMR",
        "rede": "MUFFATO VAREJO",
        "nome": "MUFFATO VAREJO  1036  PRESIDENTE PRUDENTE (PARQUE SHOPPING)",
        "cidade": "PRESIDENTE PRUDENTE",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI288",
    "promotor": "SUELEN",
    "executivo": "KARINA",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9KjsQAE",
        "canal": "C&C",
        "rede": "ASSAI",
        "nome": "ASSAI FRANCO DA ROCHA 127",
        "cidade": "FRANCO DA ROCHA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI315",
    "promotor": "CLAUDIA CRISTINA DE OLIVEIRA TARCITANO",
    "executivo": "GILSON",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9LMIQA2",
        "canal": "C&C",
        "rede": "TENDA",
        "nome": "TENDA BAURU",
        "cidade": "BAURU",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI369",
    "promotor": "KATIA REGINA SANCHES",
    "executivo": "GILSON",
    "canais": [
      "C&C",
      "DPP",
      "GMR"
    ],
    "lojas": [
      {
        "id": "001Ho00001XTqzXIAT",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "DROGA RAIA",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9J1yQAE",
        "canal": "DPP",
        "rede": "DROGAO SUPER",
        "nome": "DROGAO SUPER SAO CARLOS BOTELHO",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9HvAQAU",
        "canal": "DPP",
        "rede": "NISSEI",
        "nome": "DROGARIA NISSEI CENTRO",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Iv9QAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP SAO CARLOS",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9Ir8QAE",
        "canal": "DPP",
        "rede": "DPSP",
        "nome": "DSP SAO CARLOS II",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9JevQAE",
        "canal": "GMR",
        "rede": "GPA",
        "nome": "EX SAO CARLOS  LOJA 5736",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IYiQAM",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA SAO CARLOS B  (HIBRIDO M)",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IfwQAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA SAO CARLOS E  (NOBRE P)",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0018a00001jxkEGAAY",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA SAO CARLOS F  (HIBRIDO M)",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0018a00001x738UAAQ",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA SAO CARLOS G  (NOBRE M)",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9IexQAE",
        "canal": "DPP",
        "rede": "RAIASIL",
        "nome": "RAIA SAO CARLOS H  (HIBRIDO M)",
        "cidade": "SUMARE",
        "estado": "SPI"
      },
      {
        "id": "0014W00002e9JlnQAE",
        "canal": "C&C",
        "rede": "TONIN",
        "nome": "TONIN LOJA 12",
        "cidade": "SAO CARLOS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI426",
    "promotor": "MARIANA",
    "executivo": "KARINA",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9I0cQAE",
        "canal": "C&C",
        "rede": "ATACADAO",
        "nome": "ATACADAO ITAPECERICA DA SERRA",
        "cidade": "ITAPECERICA DA SERRA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI454",
    "promotor": "LEONARDO",
    "executivo": "KARINA",
    "canais": [
      "PERFUMARIA"
    ],
    "lojas": [
      {
        "id": "0014W00002e9K1JQAU",
        "canal": "PERFUMARIA",
        "rede": "REDE AKAI EMERSON",
        "nome": "AKAI CAMPINAS",
        "cidade": "CAMPINAS",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI475",
    "promotor": "ISAAC",
    "executivo": "KARINA",
    "canais": [
      "CLUB"
    ],
    "lojas": [
      {
        "id": "0018a00002PKRBzAAP",
        "canal": "CLUB",
        "rede": "SAMS CLUB",
        "nome": "SAMS CLUB  INDAIATUBA",
        "cidade": "INDAIATUBA",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI524",
    "promotor": "VANUSA",
    "executivo": "KARINA",
    "canais": [
      "CLUB"
    ],
    "lojas": [
      {
        "id": "0014W00002e9LaJQAU",
        "canal": "CLUB",
        "rede": "SAMS CLUB",
        "nome": "SAMS CLUB OSASCO",
        "cidade": "OSASCO",
        "estado": "SPI"
      }
    ]
  },
  {
    "setor": "SPI57",
    "promotor": "NATIELE APARECIDA BARBOSA",
    "executivo": "GILSON",
    "canais": [
      "C&C"
    ],
    "lojas": [
      {
        "id": "0014W00002e9KkjQAE",
        "canal": "C&C",
        "rede": "ASSAI",
        "nome": "ASSAI PIRACICABA CENTRO 167",
        "cidade": "PIRACICABA",
        "estado": "SPI"
      }
    ]
  }
];
