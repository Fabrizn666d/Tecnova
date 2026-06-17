import { prisma } from "../lib/prisma";

async function main() {
  const staleLinks = ["#catalogo", "/#catalogo"];
  const [bannerCtaLink, bannerCtaLink2, settings] = await Promise.all([
    prisma.banner.updateMany({ where: { ctaLink: { in: staleLinks } }, data: { ctaLink: "/productos" } }),
    prisma.banner.updateMany({ where: { ctaLink2: { in: staleLinks } }, data: { ctaLink2: "/productos" } }),
    prisma.setting.updateMany({ where: { valor: { in: staleLinks } }, data: { valor: "/productos" } }),
  ]);

  console.log(
    JSON.stringify({
      bannerCtaLink: bannerCtaLink.count,
      bannerCtaLink2: bannerCtaLink2.count,
      settings: settings.count,
    })
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
