/*
  Warnings:

  - The values [RESEARCHER,OFFICER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `_ChatSessionToDocument` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `action_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chat_sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_chunks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflow_tasks` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "_ChatSessionToDocument" DROP CONSTRAINT "_ChatSessionToDocument_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatSessionToDocument" DROP CONSTRAINT "_ChatSessionToDocument_B_fkey";

-- DropForeignKey
ALTER TABLE "action_logs" DROP CONSTRAINT "action_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "chat_sessions" DROP CONSTRAINT "chat_sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "document_chunks" DROP CONSTRAINT "document_chunks_documentId_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_uploadedById_fkey";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "_ChatSessionToDocument";

-- DropTable
DROP TABLE "action_logs";

-- DropTable
DROP TABLE "chat_messages";

-- DropTable
DROP TABLE "chat_sessions";

-- DropTable
DROP TABLE "document_chunks";

-- DropTable
DROP TABLE "documents";

-- DropTable
DROP TABLE "workflow_tasks";

-- DropEnum
DROP TYPE "ActionLogType";

-- DropEnum
DROP TYPE "ChatMessageRole";

-- DropEnum
DROP TYPE "DocumentStatus";
