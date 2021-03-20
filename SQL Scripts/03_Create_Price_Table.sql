/****** Object:  Table [dbo].[price_observations]    Script Date: 3/20/2021 12:58:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[price_observations](
	[isPPR] [bit] NULL,
	[price] [float] NULL,
	[rounds] [int] NULL,
	[PPR] [float] NULL,
	[prodTitle] [varchar](35) NULL,
	[prodSource] [varchar](15) NULL,
	[scrapeURL] [varchar](50) NULL,
	[WriteDate] [datetime] NULL,
	[ObservationID] [int] IDENTITY(1,1) NOT NULL
) ON [PRIMARY]
GO


