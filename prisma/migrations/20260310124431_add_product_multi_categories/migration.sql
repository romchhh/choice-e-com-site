-- CreateTable
CREATE TABLE "product_subcategory_links" (
    "productId" INTEGER NOT NULL,
    "subcategoryId" INTEGER NOT NULL,

    CONSTRAINT "product_subcategory_links_pkey" PRIMARY KEY ("productId","subcategoryId")
);

-- AddForeignKey
ALTER TABLE "product_subcategory_links" ADD CONSTRAINT "product_subcategory_links_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subcategory_links" ADD CONSTRAINT "product_subcategory_links_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
