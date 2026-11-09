-- Script de criação do banco "Lojas" e da tabela "produtos"

IF DB_ID('Lojas') IS NULL
    CREATE DATABASE Lojas;
GO

USE Lojas;
GO

IF OBJECT_ID('dbo.produtos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.produtos (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        nome       NVARCHAR(100)  NOT NULL,
        marca      NVARCHAR(50)   NULL,
        categoria  NVARCHAR(50)   NULL,
        descricao  NVARCHAR(MAX)  NULL,
        preco      DECIMAL(10,2)  NOT NULL,
        estoque    INT            NOT NULL DEFAULT 0,
        imagem     NVARCHAR(MAX)  NULL  
    );
END
GO

-- Dados de exemplo
IF NOT EXISTS (SELECT 1 FROM dbo.produtos)
BEGIN
    INSERT INTO dbo.produtos (nome, marca, categoria, descricao, preco, estoque, imagem) VALUES
    (N'Notebook Ultrafino 14"', N'Acme', N'Informática', N'Notebook com processador de última geração, 16 GB de RAM, SSD de 512 GB e tela Full HD de 14 polegadas. Ideal para estudo e trabalho.', 3899.90, 12, N'https://shop.samsung.com/br/samsung-galaxy-book6-ultra-16-touch-amoled-2x-intel-core-ultra-7-356h-32gb-1tb-ssd-nvdia-rtx-5060/p?idsku=16021'),
    (N'Smartphone 128 GB', N'Orbit', N'Celulares', N'Smartphone com tela AMOLED de 6,5", câmera tripla de 50 MP e bateria de 5000 mAh com carregamento rápido.', 1999.00, 30, N'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTM4KjdS0XhHt3o6iCRzNopjcKjdBTgqsbivJGDmcQC6-3Ubmt0RCNKeYuY_vJ0xygCYkw19kaBQUxoIGLshiEE7TJdu-OIRFFIKFPAJy0ZGdRKvRlEdPK_LPOuyDGU-rmqCQjEbaE&usqp=CAc'),
    (N'Fone Bluetooth', N'SoundX', N'Áudio', N'Fone de ouvido sem fio com cancelamento de ruído e até 30 horas de bateria.', 349.90, 55, N'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTM4KjdS0XhHt3o6iCRzNopjcKjdBTgqsbivJGDmcQC6-3Ubmt0RCNKeYuY_vJ0xygCYkw19kaBQUxoIGLshiEE7TJdu-OIRFFIKFPAJy0ZGdRKvRlEdPK_LPOuyDGU-rmqCQjEbaE&usqp=CAc'),
    (N'Teclado Mecânico', N'KeyPro', N'Periféricos', N'Teclado mecânico com switches azuis, iluminação RGB e layout ABNT2.', 279.00, 40, N'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSusUhpaQsoFDENJbWeAg49K6Un4u7pnI3NFsvhVVqw-dVTYQOg_d0ovoHMsPJATuudwdKeCoxPwzChs6EFKwUqlRh25p583re0FkXu1EnAELHyEwMy-wpvNJ7KHSFe_VJmqgSvP30D7A&usqp=CAc'),
    (N'Mouse Gamer', N'KeyPro', N'Periféricos', N'Mouse óptico de 16000 DPI com 7 botões programáveis e design ergonômico.', 159.90, 60, N'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS9bHDRxzQOQu5QBIaJ2FM_N1-TcV2S0grSELNcjeuAjBNbl8rEissWwD5Fd912AoyTQJLC-Q2xEmRjs1v4WCTufKR0hpaY8Up9qn248FRtYeHah6lZYEJD5kO2PihqpUCafAiejQ&usqp=CAc'),
    (N'Monitor 27" 144 Hz', N'ViewMax', N'Monitores', N'Monitor IPS de 27 polegadas com taxa de atualização de 144 Hz e tempo de resposta de 1 ms.', 1499.00, 18, N'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQfNdy0RbqquCBs4bEEzhoooHzZBEWklFrlXB4WxdLsM-d6wAJTeLKDIEwjHFemfeYGTfoF2xQlAb1wVCkPq7uEFwlhqqFLYlb5cgfwIC6NRevPpBBvOi9WZl3IQ-fQ6WBTNf-WGFk&usqp=CAc'),
    (N'Cadeira Ergonômica', N'ConfortPlus', N'Móveis', N'Cadeira de escritório com apoio lombar ajustável, braços 3D e encosto em tela respirável.', 1190.00, 9, N'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSlCFLdy6VblKJKKhmL0szQ8Si4QufytCYuVdV4vgL6jqgyDoITzuZlhFEsVpWdV4FefPCDhSibb7ZG_DEA9u4Eores86fGXTedvG8_npYDwB633bhtGH14I3Pkkakcg_m5hB47HAc&usqp=CAc'),
    (N'Webcam Full HD', N'ViewMax', N'Periféricos', N'Webcam 1080p com microfone embutido e foco automático para aulas e reuniões online.', 229.90, 35, N'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSKYdwapslCo85K4OhezNxPza-etJCnmR3xMqS-vRBkxGXMmQbpfYkoj7yx5_AXVBysFh7qvPnB7P-S2DfKHXIq3m31i9qneJTCAWpT0L8gZF_icJtZa64k9zZLLv1vrV-aiHKcP0iMAMGL&usqp=CAc'),
    (N'Caixa de Som Portátil', N'SoundX', N'Áudio', N'Caixa de som Bluetooth à prova d''água com 12 horas de reprodução.', 299.00, 25, N'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQpRvH7dM7uftTobP6ys1Co5rzGcLKrgT4OkuFbN0GS442VTcQ5JZhiJjHpxg89feD9pM56Esl_OxGUBac_Hom1cpeK9OzaXXxh-0Skj2MeCn2VYMTGHdp0ADYN83clZF6l4jOysttUk_A&usqp=CAc'),
    (N'SSD Externo 1 TB', N'Acme', N'Armazenamento', N'SSD portátil com velocidade de leitura de até 1050 MB/s e conexão USB-C.', 599.90, 22, N'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ13n1pD6jUN_BPr7L-ydtmOeV7W73_0xxO27Oa8F0xHHXuJzpM9gXIGsd6CMHisG3ZIMPPqe95FFR1sg5nHeaEYYM2Xf70dgzy1wh3JVd_&usqp=CAc'),
    (N'Tablet 10"', N'Orbit', N'Tablets', N'Tablet com tela de 10 polegadas, 64 GB de armazenamento e caneta digital inclusa.', 1299.00, 14, N'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQh32_Cyj7Kh9iwUEtjwwhx9S_NuHUyGW4YD9tg136lDHhlSOtyeULjFvo4Nj_oGlIYr1LzwqvOGc37jmKlBWsQtv4ivz4xvslH1HMSwJnqvoGd9AJMMp-OFOdvarJKM2af6-9LxQ&usqp=CAc'),
    (N'Smartwatch Fit', N'Orbit', N'Wearables', N'Relógio inteligente com monitor cardíaco, GPS integrado e resistência à água.', 449.90, 28, N'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT35VlhTP9XI1szrzJzRJbbXnn8D70r87jGyDPuQJenfLdyMlmKLDqflHykoaNXksAZVx2GF7NxIKO_XrWelEweuIg2pnAj8SS4VHEObhDxX8tM_xy6D85nDoKl4lQ1Q2Vt-q0mJQ&usqp=CAc'),
    (N'Roteador Wi-Fi 6', N'NetLink', N'Redes', N'Roteador dual band Wi-Fi 6 com cobertura para até 120 m² e 4 antenas externas.', 399.00, 16, N'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT8EBpUw7VShFoby6qC1tUSVSFcm_jsG6T3kLoWtiRJdzUTruQ7k1Urreyvu9Bk5or5kCp1PzD4SrtrzwgGQVVQWS3lhv-eg6lm4OZl6IOfp4KtocYuBGGB-5uNe_IjqF2guVO6nLnm&usqp=CAc'),
    (N'Hub USB-C 7 em 1', N'Acme', N'Acessórios', N'Hub com HDMI 4K, leitor de cartão SD, 3 portas USB 3.0 e entrega de energia de 100 W.', 189.90, 45, N'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRG-XGAOv2YRp-fZfV7KYUkozEBFJXBG3F04bVFFzBnquhg_B8cgKUrk723w1XcG4mJadBJaj8Nb58zItaeFsVN_c5QRoO_-HWMnxlBJGEbvkM5LFzARzyzevdEQQGlnE22yLFZEhIKaY8&usqp=CAc');
END
GO
