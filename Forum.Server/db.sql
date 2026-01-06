-- ==================================================
-- Forum Database Creation Script
-- Run this script in SQL Server Management Studio
-- ==================================================

USE master;
GO

-- Drop database if exists
IF DB_ID('ForumDb') IS NOT NULL
BEGIN
    ALTER DATABASE ForumDb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ForumDb;
END
GO

-- Create database
CREATE DATABASE ForumDb;
GO

USE ForumDb;
GO

-- ==================================================
-- Create ASP.NET Core Identity Tables
-- ==================================================

-- AspNetRoles
CREATE TABLE [dbo].[AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO

-- AspNetUsers
CREATE TABLE [dbo].[AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset(7) NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    [DisplayName] nvarchar(max) NOT NULL DEFAULT '',
    [JoinDate] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    [IsActive] bit NOT NULL DEFAULT 1,
    [Avatar] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
);
GO

-- AspNetRoleClaims
CREATE TABLE [dbo].[AspNetRoleClaims] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO

-- AspNetUserClaims
CREATE TABLE [dbo].[AspNetUserClaims] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

-- AspNetUserLogins
CREATE TABLE [dbo].[AspNetUserLogins] (
    [LoginProvider] nvarchar(450) NOT NULL,
    [ProviderKey] nvarchar(450) NOT NULL,
    [ProviderDisplayName] nvarchar(max) NULL,
    [UserId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
    CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

-- AspNetUserRoles
CREATE TABLE [dbo].[AspNetUserRoles] (
    [UserId] nvarchar(450) NOT NULL,
    [RoleId] nvarchar(450) NOT NULL,
    CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
    CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

-- AspNetUserTokens
CREATE TABLE [dbo].[AspNetUserTokens] (
    [UserId] nvarchar(450) NOT NULL,
    [LoginProvider] nvarchar(450) NOT NULL,
    [Name] nvarchar(450) NOT NULL,
    [Value] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
    CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO

-- ==================================================
-- Create Forum Tables
-- ==================================================

-- Categories
CREATE TABLE [dbo].[Categories] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Name] nvarchar(100) NOT NULL,
    [Description] nvarchar(500) NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    [IsActive] bit NOT NULL DEFAULT 1,
    [Order] int NOT NULL DEFAULT 0,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
);
GO

-- Topics
CREATE TABLE [dbo].[Topics] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Title] nvarchar(200) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2(7) NULL,
    [IsApproved] bit NOT NULL DEFAULT 0,
    [IsLocked] bit NOT NULL DEFAULT 0,
    [IsPinned] bit NOT NULL DEFAULT 0,
    [ViewCount] int NOT NULL DEFAULT 0,
    [UserId] nvarchar(450) NOT NULL,
    [CategoryId] int NOT NULL,
    [ApprovedByUserId] nvarchar(450) NULL,
    [ApprovedAt] datetime2(7) NULL,
    CONSTRAINT [PK_Topics] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Topics_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_Topics_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]),
    CONSTRAINT [FK_Topics_AspNetUsers_ApprovedByUserId] FOREIGN KEY ([ApprovedByUserId]) REFERENCES [AspNetUsers] ([Id])
);
GO

-- Replies
CREATE TABLE [dbo].[Replies] (
    [Id] int IDENTITY(1,1) NOT NULL,
    [Content] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2(7) NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2(7) NULL,
    [IsApproved] bit NOT NULL DEFAULT 0,
    [TopicId] int NOT NULL,
    [UserId] nvarchar(450) NOT NULL,
    [ApprovedByUserId] nvarchar(450) NULL,
    [ApprovedAt] datetime2(7) NULL,
    CONSTRAINT [PK_Replies] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Replies_Topics_TopicId] FOREIGN KEY ([TopicId]) REFERENCES [Topics] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_Replies_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK_Replies_AspNetUsers_ApprovedByUserId] FOREIGN KEY ([ApprovedByUserId]) REFERENCES [AspNetUsers] ([Id])
);
GO

-- ==================================================
-- Create Indexes
-- ==================================================

-- Identity Indexes
CREATE UNIQUE INDEX [IX_AspNetRoles_NormalizedName] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
CREATE UNIQUE INDEX [IX_AspNetUsers_NormalizedEmail] ON [AspNetUsers] ([NormalizedEmail]) WHERE [NormalizedEmail] IS NOT NULL;
CREATE UNIQUE INDEX [IX_AspNetUsers_NormalizedUserName] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;

-- Forum Indexes
CREATE INDEX [IX_Topics_UserId] ON [Topics] ([UserId]);
CREATE INDEX [IX_Topics_CategoryId] ON [Topics] ([CategoryId]);
CREATE INDEX [IX_Topics_ApprovedByUserId] ON [Topics] ([ApprovedByUserId]);
CREATE INDEX [IX_Topics_IsApproved] ON [Topics] ([IsApproved]);
CREATE INDEX [IX_Topics_CreatedAt] ON [Topics] ([CreatedAt]);
CREATE INDEX [IX_Topics_IsPinned] ON [Topics] ([IsPinned]);

CREATE INDEX [IX_Replies_TopicId] ON [Replies] ([TopicId]);
CREATE INDEX [IX_Replies_UserId] ON [Replies] ([UserId]);
CREATE INDEX [IX_Replies_ApprovedByUserId] ON [Replies] ([ApprovedByUserId]);
CREATE INDEX [IX_Replies_IsApproved] ON [Replies] ([IsApproved]);
CREATE INDEX [IX_Replies_CreatedAt] ON [Replies] ([CreatedAt]);

CREATE INDEX [IX_Categories_IsActive] ON [Categories] ([IsActive]);
CREATE INDEX [IX_Categories_Order] ON [Categories] ([Order]);

-- ==================================================
-- Insert Seed Data
-- ==================================================

-- Insert Admin Role
INSERT INTO [AspNetRoles] ([Id], [Name], [NormalizedName], [ConcurrencyStamp])
VALUES (NEWID(), 'Admin', 'ADMIN', NEWID());
GO

-- Insert Default Categories
INSERT INTO [Categories] ([Name], [Description], [Order]) VALUES 
(N'Thảo luận chung', N'Nơi thảo luận các chủ đề tổng quát', 1),
(N'Công nghệ', N'Thảo luận về công nghệ thông tin', 2),
(N'Giải trí', N'Các chủ đề giải trí, thể thao', 3);
GO

-- Insert Default Admin User
DECLARE @AdminId NVARCHAR(450) = NEWID();
DECLARE @RoleId NVARCHAR(450) = (SELECT TOP 1 [Id] FROM [AspNetRoles] WHERE [Name] = 'Admin');

INSERT INTO [AspNetUsers] 
([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], 
 [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumberConfirmed], 
 [TwoFactorEnabled], [LockoutEnabled], [AccessFailedCount], [DisplayName], [JoinDate], [IsActive])
VALUES 
(@AdminId, 'admin@forum.com', 'ADMIN@FORUM.COM', 'admin@forum.com', 'ADMIN@FORUM.COM', 1,
 'AQAAAAIAAYagAAAAEEwYG7I72algW0Sz5XRIrFpe/MNATr3RjCk4nA/5Rv5uZUUuD6hzAfRO6qhVBkx1rg==', -- Password: Admin123@
 NEWID(), NEWID(), 0, 0, 1, 0, 'Administrator', GETUTCDATE(), 1);

-- Assign Admin Role to Admin User
INSERT INTO [AspNetUserRoles] ([UserId], [RoleId])
VALUES (@AdminId, @RoleId);
GO

-- ==================================================
-- Create Sample Data (Optional)
-- ==================================================

-- Insert Sample Users
DECLARE @User1Id NVARCHAR(450) = NEWID();
DECLARE @User2Id NVARCHAR(450) = NEWID();

INSERT INTO [AspNetUsers] 
([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed], 
 [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumberConfirmed], 
 [TwoFactorEnabled], [LockoutEnabled], [AccessFailedCount], [DisplayName], [JoinDate], [IsActive])
VALUES 
(@User1Id, 'user1@forum.com', 'USER1@FORUM.COM', 'user1@forum.com', 'USER1@FORUM.COM', 1,
 'AQAAAAIAAYagAAAAEEwYG7I72algW0Sz5XRIrFpe/MNATr3RjCk4nA/5Rv5uZUUuD6hzAfRO6qhVBkx1rg==', -- Password: Admin123@
 NEWID(), NEWID(), 0, 0, 1, 0, 'Thành viên 1', GETUTCDATE(), 1),
(@User2Id, 'user2@forum.com', 'USER2@FORUM.COM', 'user2@forum.com', 'USER2@FORUM.COM', 1,
 'AQAAAAIAAYagAAAAEEwYG7I72algW0Sz5XRIrFpe/MNATr3RjCk4nA/5Rv5uZUUuD6hzAfRO6qhVBkx1rg==', -- Password: Admin123@
 NEWID(), NEWID(), 0, 0, 1, 0, 'Thành viên 2', GETUTCDATE(), 1);

-- Insert Sample Topics
DECLARE @CategoryId INT = (SELECT TOP 1 Id FROM Categories WHERE Name = N'Thảo luận chung');

INSERT INTO [Topics] ([Title], [Content], [UserId], [CategoryId], [IsApproved], [ViewCount])
VALUES 
(N'Chào mừng đến với diễn đàn!', N'Đây là bài viết chào mừng các thành viên mới tham gia diễn đàn.', @User1Id, @CategoryId, 1, 5),
(N'Quy định của diễn đàn', N'Vui lòng đọc kỹ các quy định trước khi tham gia thảo luận.', @User1Id, @CategoryId, 1, 12);

-- Insert Sample Replies
DECLARE @TopicId INT = (SELECT TOP 1 Id FROM Topics WHERE Title = N'Chào mừng đến với diễn đàn!');

INSERT INTO [Replies] ([Content], [TopicId], [UserId], [IsApproved])
VALUES 
(N'Cảm ơn admin! Rất vui được tham gia diễn đàn này.', @TopicId, @User2Id, 1),
(N'Diễn đàn trông có vẻ rất thú vị!', @TopicId, @User2Id, 1);

GO

