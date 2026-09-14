import { PrismaClient } from "@prisma/client";
import { DEFAULT_PERSONAS } from "../src/data/defaultPersonas.js";

const prisma = new PrismaClient();

async function syncDb() {
  console.log("Syncing database personas with DEFAULT_PERSONAS...");
  try {
    for (const p of DEFAULT_PERSONAS) {
      console.log(`Updating/Upserting slug: ${p.slug}...`);
      const existing = await prisma.persona.findUnique({
        where: { slug: p.slug }
      });

      if (existing) {
        await prisma.persona.update({
          where: { slug: p.slug },
          data: {
            name: p.name,
            description: p.description,
            profileImage: p.profileImage || null,
            coverImage: p.coverImage || null,
            gallery: p.gallery || "",
            shortBio: p.shortBio,
            longBio: p.longBio,
            personality: p.personality,
            background: p.background,
            interests: p.interests,
            hobbies: p.hobbies,
            likes: p.likes,
            dislikes: p.dislikes,
            speakingStyle: p.speakingStyle,
            communicationTone: p.communicationTone,
            flirtLevel: p.flirtLevel,
            emojiFrequency: p.emojiFrequency,
            systemPrompt: p.systemPrompt,
            occupation: p.occupation,
            languages: p.languages,
            age: p.age,
            city: p.city,
            country: p.country,
            bodyType: p.bodyType,
            bustSize: p.bustSize,
            height: p.height,
            eyeColor: p.eyeColor,
            hairColor: p.hairColor,
            tattoosAndPiercings: p.tattoosAndPiercings,
            turnOns: p.turnOns,
            turnOffs: p.turnOffs,
            fantasies: p.fantasies,
            intimacyStyle: p.intimacyStyle,
            preferredVibe: p.preferredVibe,
            kinksAndFetishes: p.kinksAndFetishes,
            favoriteLingerie: p.favoriteLingerie,
            eroticInterests: p.eroticInterests,
            active: true
          }
        });
      } else {
        await prisma.persona.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: p.description,
            profileImage: p.profileImage || null,
            coverImage: p.coverImage || null,
            gallery: p.gallery || "",
            age: p.age,
            city: p.city,
            country: p.country,
            occupation: p.occupation,
            languages: p.languages,
            shortBio: p.shortBio,
            longBio: p.longBio,
            bodyType: p.bodyType,
            bustSize: p.bustSize,
            height: p.height,
            eyeColor: p.eyeColor,
            hairColor: p.hairColor,
            tattoosAndPiercings: p.tattoosAndPiercings,
            turnOns: p.turnOns,
            turnOffs: p.turnOffs,
            fantasies: p.fantasies,
            intimacyStyle: p.intimacyStyle,
            preferredVibe: p.preferredVibe,
            kinksAndFetishes: p.kinksAndFetishes,
            favoriteLingerie: p.favoriteLingerie,
            eroticInterests: p.eroticInterests,
            personality: p.personality,
            background: p.background,
            interests: p.interests,
            hobbies: p.hobbies,
            likes: p.likes,
            dislikes: p.dislikes,
            speakingStyle: p.speakingStyle,
            communicationTone: p.communicationTone,
            flirtLevel: p.flirtLevel,
            emojiFrequency: p.emojiFrequency,
            systemPrompt: p.systemPrompt,
            active: true
          }
        });
      }
    }
    console.log("Successfully synced database personas!");
  } catch (err) {
    console.error("Error syncing DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

syncDb();
