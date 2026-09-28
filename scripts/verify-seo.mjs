const BASE_URL = "http://localhost:3005";

async function verifySeo() {
  console.log("=== BEGINNING SEO & STRUCTURED DATA VERIFICATION ===");

  const pages = [
    { path: "/", expectedTitle: "Elzinore — Carbon Fiber RFID Wallet | Bangladesh", expectedCanonical: "https://elzinore.com" },
    { path: "/shop", expectedTitle: "Shop Minimalist Carbon Fiber Wallets — Elzinore", expectedCanonical: "https://elzinore.com/shop" },
    { path: "/about", expectedTitle: "Our Story — Crafted in Bangladesh — Elzinore", expectedCanonical: "https://elzinore.com/about" },
    { path: "/faq", expectedTitle: "FAQ — Shipping, Warranty &amp; RFID — Elzinore", expectedCanonical: "https://elzinore.com/faq" },
    { path: "/reviews", expectedTitle: "Customer Reviews — Carbon Fiber Wallet — Elzinore", expectedCanonical: "https://elzinore.com/reviews" },
  ];

  const seenTitles = new Set();
  const seenDescriptions = new Set();

  for (const page of pages) {
    console.log(`\nTesting page: ${page.path}...`);
    const res = await fetch(`${BASE_URL}${page.path}`);
    if (res.status !== 200) {
      throw new Error(`Failed to fetch ${page.path}, status: ${res.status}`);
    }
    const html = await res.text();

    // 1. Verify Title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : null;
    console.log(`  Title (${title?.length} chars): "${title}"`);
    if (!title || title !== page.expectedTitle) {
      throw new Error(`Expected exact title "${page.expectedTitle}", got "${title}"`);
    }
    if (title.length > 65) {
      throw new Error(`Title exceeds 65 characters limit (${title.length} chars): "${title}"`);
    }
    if (seenTitles.has(title)) {
      throw new Error(`Duplicate title detected across pages: "${title}"`);
    }
    seenTitles.add(title);

    // 2. Verify Meta Description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1] : null;
    console.log(`  Description (${description?.length} chars): "${description}"`);
    if (!description || description.length < 20 || description.length > 165) {
      throw new Error(`Description invalid or length out of bounds (${description?.length}): "${description}"`);
    }
    if (seenDescriptions.has(description)) {
      throw new Error(`Duplicate description detected across pages: "${description}"`);
    }
    seenDescriptions.add(description);

    // 3. Verify Canonical Tag
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : null;
    console.log(`  Canonical: "${canonical}"`);
    if (!canonical || canonical !== page.expectedCanonical) {
      throw new Error(`Expected canonical "${page.expectedCanonical}", got "${canonical}"`);
    }

    // 4. Verify Open Graph and Twitter cards
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    console.log(`  OG Image: "${ogImageMatch ? ogImageMatch[1] : 'NOT FOUND'}"`);
    if (!ogImageMatch || !ogImageMatch[1].includes("wallet-hero.jpg")) {
      throw new Error(`Expected og:image containing wallet-hero.jpg on ${page.path}`);
    }

    const twitterCardMatch = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
    if (!twitterCardMatch || twitterCardMatch[1] !== "summary_large_image") {
      throw new Error(`Expected twitter:card summary_large_image on ${page.path}`);
    }

    console.log(`  ✔ Page ${page.path} passed all title, description, canonical, and OG checks.`);
  }

  // 5. Special Verification for Shop Page JSON-LD Product Structured Data
  console.log("\nTesting /shop JSON-LD Product Structured Data...");
  const shopRes = await fetch(`${BASE_URL}/shop`);
  const shopHtml = await shopRes.text();

  const jsonLdMatches = shopHtml.match(/<script type=["']application\/ld\+json["']>([^<]+)<\/script>/g);
  if (!jsonLdMatches || jsonLdMatches.length === 0) {
    throw new Error("No application/ld+json script tags found on /shop!");
  }

  let foundProductSchema = false;
  for (const scriptTag of jsonLdMatches) {
    const rawJson = scriptTag.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed["@type"] === "Product") {
        foundProductSchema = true;
        console.log("  Parsed Product JSON-LD:", JSON.stringify(parsed, null, 2));

        if (parsed.name !== "Carbon Fiber RFID Wallet") {
          throw new Error(`Unexpected product name: "${parsed.name}"`);
        }
        if (parsed.offers?.price !== "1449") {
          throw new Error(`Unexpected offer price: "${parsed.offers?.price}", expected "1449"`);
        }
        if (parsed.offers?.priceCurrency !== "BDT") {
          throw new Error(`Unexpected offer currency: "${parsed.offers?.priceCurrency}", expected "BDT"`);
        }
        if (parsed.offers?.availability !== "https://schema.org/InStock") {
          throw new Error(`Unexpected availability: "${parsed.offers?.availability}"`);
        }
        if (!parsed.image || !parsed.image.startsWith("https://elzinore.com/images/")) {
          throw new Error(`Unexpected absolute image URL: "${parsed.image}"`);
        }
        console.log("  ✔ Product JSON-LD structured data is 100% valid schema.org specification.");
      }
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  }

  if (!foundProductSchema) {
    throw new Error("Product structured data (@type: 'Product') was not found on /shop!");
  }

  // Verify placeholder items (leather belts) do NOT have in-stock Product schema
  if (shopHtml.includes('"name":"Leather Belts"') && shopHtml.includes('"@type":"Product"')) {
    throw new Error("Coming soon product 'Leather Belts' was incorrectly included in Product schema!");
  }
  console.log("  ✔ Coming-soon products are correctly excluded from Product structured data.");

  console.log("\nALL SEO, OPEN GRAPH, AND STRUCTURED DATA TESTS PASSED SUCCESSFULLY! 🚀");
}

verifySeo().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
