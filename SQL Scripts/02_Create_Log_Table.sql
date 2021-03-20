/****** Object:  Table [dbo].[logs]    Script Date: 3/20/2021 12:55:31 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[logs](
	[LogDate] [datetime] NOT NULL,
	[LogEntry] [varchar](100) NULL
) ON [PRIMARY]
GO


