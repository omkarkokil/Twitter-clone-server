-- CreateTable
CREATE TABLE "Follows" (
    "followerid" TEXT NOT NULL,
    "followingid" TEXT NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerid","followingid")
);

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerid_fkey" FOREIGN KEY ("followerid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingid_fkey" FOREIGN KEY ("followingid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
