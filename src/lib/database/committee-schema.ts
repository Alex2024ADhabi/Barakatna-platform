// Committee Management Domain Schema for Barakatna Platform

// This file defines the committee management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Committee Schema
export const committeeSchema = {
  tableName: "Committee",
  columns: {
    committeeId: { type: "INT", primaryKey: true, autoIncrement: true },
    committeeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    committeeNameEN: { type: "NVARCHAR(100)", notNull: true },
    committeeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    committeeTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "CommitteeType", column: "committeeTypeId" },
    },
    chairpersonId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    formationDate: { type: "DATE", notNull: true },
    dissolutionDate: { type: "DATE" },
    meetingFrequency: { type: "VARCHAR(50)" },
    quorumRequirement: { type: "INT" },
    isActive: { type: "BIT", notNull: true, default: 1 },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// Committee Type Schema
export const committeeTypeSchema = {
  tableName: "CommitteeType",
  columns: {
    committeeTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Committee Member Schema
export const committeeMemberSchema = {
  tableName: "CommitteeMember",
  columns: {
    committeeMemberId: { type: "INT", primaryKey: true, autoIncrement: true },
    committeeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Committee", column: "committeeId" },
    },
    userId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    roleInCommittee: { type: "VARCHAR(50)", notNull: true },
    joinDate: { type: "DATE", notNull: true },
    endDate: { type: "DATE" },
    votingRights: { type: "BIT", notNull: true, default: 1 },
    notes: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
  },
  constraints: [{ type: "UNIQUE", columns: ["committeeId", "userId"] }],
};

// Committee Meeting Schema
export const committeeMeetingSchema = {
  tableName: "CommitteeMeeting",
  columns: {
    meetingId: { type: "INT", primaryKey: true, autoIncrement: true },
    committeeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Committee", column: "committeeId" },
    },
    meetingCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    meetingDate: { type: "DATETIME", notNull: true },
    location: { type: "NVARCHAR(100)" },
    agenda: { type: "NVARCHAR(MAX)" },
    minutes: { type: "NVARCHAR(MAX)" },
    chairpersonId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    secretaryId: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    quorumMet: { type: "BIT", notNull: true, default: 0 },
    meetingDuration: { type: "INT" }, // in minutes
    nextMeetingDate: { type: "DATETIME" },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};
