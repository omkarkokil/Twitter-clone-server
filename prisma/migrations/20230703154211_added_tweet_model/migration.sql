-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "authorid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_authorid_fkey" FOREIGN KEY ("authorid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
