import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import Post from "../src/models/Post";

const MONGODB_URI = process.env.MONGODB_URI!;

const title = "Matthew Stafford: The Resilient Master of Modern Quarterbacking";
const excerpt =
  "An analytical exploration of Matthew Stafford's career trajectory—from his high-volume years in Detroit to his tactical maturation and championship fulfillment under the Los Angeles Rams.";

const content = `
<div style="font-family: 'Inter', sans-serif; color: #e4e4e7; max-width: 900px; margin: 0 auto;">

  <!-- Hero Stats -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #27272a;">
    <div style="border-left: 2px solid #3f3f46; padding-left: 1rem;">
      <div style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Career Pass Yards</div>
      <div style="font-size: 1.5rem; font-weight: 600; color: #fff; margin-top: 2px;">60,248</div>
    </div>
    <div style="border-left: 2px solid #3f3f46; padding-left: 1rem;">
      <div style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Passing TDs</div>
      <div style="font-size: 1.5rem; font-weight: 600; color: #fff; margin-top: 2px;">403</div>
    </div>
    <div style="border-left: 2px solid #3f3f46; padding-left: 1rem;">
      <div style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">MVP Titles</div>
      <div style="font-size: 1.5rem; font-weight: 600; color: #f59e0b; margin-top: 2px;">1 (2025)</div>
    </div>
  </div>

  <!-- Player Overview Card -->
  <div style="border: 1px solid #3f3f46; background: rgba(24,24,27,0.4); padding: 2rem; border-radius: 1rem; margin-bottom: 2.5rem;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #27272a; padding-bottom: 1.25rem; margin-bottom: 1.25rem;">
      <div>
        <div style="font-size: 1.1rem; font-weight: 600; color: #fff;">John Matthew Stafford</div>
        <div style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">Active Roster — No. 9</div>
      </div>
      <span style="font-size: 1.5rem; font-weight: 600; color: #52525b;">QB</span>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.875rem;">
      <div style="display: flex; justify-content: space-between;"><span style="color: #71717a;">Draft Position</span><span style="color: #d4d4d8; font-weight: 500;">2009 / Round 1 / Pick 1</span></div>
      <div style="display: flex; justify-content: space-between;"><span style="color: #71717a;">Franchises Served</span><span style="color: #d4d4d8; font-weight: 500;">Detroit Lions, LA Rams</span></div>
      <div style="display: flex; justify-content: space-between;"><span style="color: #71717a;">Height / Weight</span><span style="color: #d4d4d8; font-weight: 500;">6'3" / 220 lbs</span></div>
      <div style="display: flex; justify-content: space-between;"><span style="color: #71717a;">Active Tenure</span><span style="color: #d4d4d8; font-weight: 500;">18 NFL Seasons</span></div>
    </div>
  </div>

  <!-- Section: Milestones & Accolades -->
  <h2 style="font-size: 1.5rem; font-weight: 600; color: #fff; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Milestones &amp; Accolades</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #f59e0b; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Award Recognition</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">2025 NFL Most Valuable Player</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Secured the league's highest individual honor at age 37, finishing the campaign with 4,707 passing yards and a league-leading 46 passing touchdowns.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Franchise Pinnacle</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">Super Bowl LVI Championship</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Engineered a precise 15-play, game-winning offensive drive during the fourth quarter of Super Bowl LVI, securing his place in NFL lore.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Volume Dominance</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">The 5,000-Yard Milestone</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Recorded a historic 5,038 passing yards in 2011, becoming only the fourth quarterback in league history to surpass the single-season milestone.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Efficiency Speed</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">Accelerated Stat Records</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Stands as the fastest quarterback in NFL history to cross major milestones, including the 30,000, 40,000, and 45,000 career passing yard benchmarks.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Clutch Performance</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">Fourth-Quarter Records</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Co-holds the single-season NFL record with 8 fourth-quarter comebacks in 2016, showcasing elite composure under high-pressure scenarios.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.4); padding: 1.5rem; border-radius: 0.75rem;">
      <div style="color: #a1a1aa; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Career Longevity</div>
      <h3 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">18 Seasons of Excellence</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Demonstrated outstanding durability and consistency, successfully transitioning across two generations of offensive schemes and philosophies.</p>
    </div>

  </div>

  <!-- Section: Career Chronology -->
  <h2 style="font-size: 1.5rem; font-weight: 600; color: #fff; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Career Chronology</h2>
  <div style="border-left: 2px solid #3f3f46; padding-left: 1.5rem; margin-left: 0.5rem; margin-bottom: 2.5rem;">

    <div style="margin-bottom: 2rem; position: relative;">
      <div style="width: 12px; height: 12px; background: #18181b; border: 2px solid #52525b; border-radius: 50%; position: absolute; left: -2rem; top: 4px;"></div>
      <div style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">2009</div>
      <h3 style="font-size: 1.05rem; font-weight: 500; color: #fff; margin: 4px 0;">Entry into the League</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Drafted first overall by the Detroit Lions. Stafford inherited an organization burdened by the NFL's first-ever 0-16 season. From his first snap, he was tasked with absolute structural franchise resurrection.</p>
    </div>

    <div style="margin-bottom: 2rem; position: relative;">
      <div style="width: 12px; height: 12px; background: #18181b; border: 2px solid #3f3f46; border-radius: 50%; position: absolute; left: -2rem; top: 4px;"></div>
      <div style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">2009 — 2010</div>
      <h3 style="font-size: 1.05rem; font-weight: 500; color: #fff; margin: 4px 0;">Injury Tribulations</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Early setbacks limited Stafford to just 13 total appearances out of 32 games in his first two years. Critics labeled his potential unsustainable due to consecutive shoulder injuries, testing his professional fortitude.</p>
    </div>

    <div style="margin-bottom: 2rem; position: relative;">
      <div style="width: 12px; height: 12px; background: #18181b; border: 2px solid #3f3f46; border-radius: 50%; position: absolute; left: -2rem; top: 4px;"></div>
      <div style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">2011 — 2020</div>
      <h3 style="font-size: 1.05rem; font-weight: 500; color: #fff; margin: 4px 0;">Detroit Volume &amp; Playoff Deficits</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Established himself as one of the league's preeminent high-volume passers alongside wide receiver Calvin Johnson. Despite historic stats, structural issues within the organization led to a difficult 0-3 playoff record over a decade of dedication.</p>
    </div>

    <div style="margin-bottom: 2rem; position: relative;">
      <div style="width: 12px; height: 12px; background: #18181b; border: 2px solid #52525b; border-radius: 50%; position: absolute; left: -2rem; top: 4px;"></div>
      <div style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">2021</div>
      <h3 style="font-size: 1.05rem; font-weight: 500; color: #fff; margin: 4px 0;">Strategic Realignment</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Stafford was traded to the Los Angeles Rams in a monumental blockbuster transaction. The move instantly united Stafford with head coach Sean McVay, offering him a system designed to maximize his field-stretching capability.</p>
    </div>

    <div style="margin-bottom: 0; position: relative;">
      <div style="width: 12px; height: 12px; background: #18181b; border: 2px solid #52525b; border-radius: 50%; position: absolute; left: -2rem; top: 4px;"></div>
      <div style="color: #71717a; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">2021 — 2025</div>
      <h3 style="font-size: 1.05rem; font-weight: 500; color: #fff; margin: 4px 0;">Championship Realization &amp; Career Peak</h3>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Silenced legacy critiques in rapid fashion. Stafford captured Super Bowl LVI in his debut Los Angeles campaign, subsequently cementing his individual greatness by securing the NFL Most Valuable Player award in 2025.</p>
    </div>

  </div>

  <!-- Section: Historical Insights -->
  <h2 style="font-size: 1.5rem; font-weight: 600; color: #fff; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid #27272a;">Historical Insights</h2>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.45); padding: 2rem; border-radius: 0.75rem;">
      <div style="color: #52525b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Synergetic Foundations</div>
      <h4 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">The Highland Park Connection</h4>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Stafford attended Highland Park High School alongside future MLB legendary Cy Young pitcher Clayton Kershaw. The two were childhood best friends, with Stafford catching for Kershaw in baseball, and Kershaw serving as Stafford's offensive lineman in early football leagues.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.45); padding: 2rem; border-radius: 0.75rem;">
      <div style="color: #52525b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Scouting Precision</div>
      <h4 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">The Kiper Forecast</h4>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Stafford's raw technical ability was recognized incredibly early. Draft expert Mel Kiper Jr. observed Stafford during his high school career and forecast him as a future consensus first overall NFL pick before Stafford had ever registered a single collegiate snap for Georgia.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.45); padding: 2rem; border-radius: 0.75rem;">
      <div style="color: #52525b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Analytical Mechanics</div>
      <h4 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">The No-Look Angle Paradigm</h4>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Well before the modern popularized trend of no-look passes, Stafford revolutionized standard pocket operations by adjusting his throwing release angles dynamically. His deep baseball background allowed him to master sidearm trajectory angles to clear interior defensive rushes.</p>
    </div>

    <div style="border: 1px solid #27272a; background: rgba(9,9,11,0.45); padding: 2rem; border-radius: 0.75rem;">
      <div style="color: #52525b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem;">Documented Fortitude</div>
      <h4 style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 0.5rem;">The Cleveland Incident (2009)</h4>
      <p style="color: #a1a1aa; font-size: 0.875rem; line-height: 1.6;">Stafford's trademark toughness was crystallized in his rookie season. After suffering a severe shoulder separation on a late-game play, he bypassed athletic trainers during an adjacent timeout, re-took the field with an immobilized shoulder, and threw the walk-off game-winning touchdown pass.</p>
    </div>

  </div>

  <!-- Editorial Quote -->
  <div style="border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; padding: 3rem 0; text-align: center; margin-bottom: 2rem;">
    <blockquote style="font-style: italic; font-size: 1.3rem; color: #d4d4d8; max-width: 700px; margin: 0 auto; line-height: 1.7;">
      "There are guys who throw the ball, and then there are truly elite, rare pocket strategists. Stafford is the latter. His structural processing speed matches his elite arm caliber."
    </blockquote>
    <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 1rem;">— Tactical Football Synthesis Review</p>
  </div>

</div>
`;

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (await Post.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const post = await Post.create({
    slug,
    title,
    excerpt,
    content,
    author: "NFL Predictions Hub Staff",
    tags: ["Matthew Stafford", "Los Angeles Rams", "Detroit Lions", "QB Profile", "NFL MVP", "Super Bowl LVI", "NFL Analysis"],
    published: true,
    metaTitle: "Matthew Stafford Career Profile | NFL Predictions Hub",
    metaDescription: "Explore Matthew Stafford's complete career — from #1 overall pick in Detroit to Super Bowl champion and 2025 NFL MVP with the Los Angeles Rams.",
  });

  console.log(`Post created: ${post.slug}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
