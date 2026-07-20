"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ExternalLink, Globe, RotateCcw, Search, TrendingUp } from "lucide-react";

const STORAGE_KEY = "profile_backlink_completed";

type Site = {
  name: string;
  url: string;
  da: number;
  countries: string[]; // "global" = international only; specific code = that country only
  category: string;
};

const SITES: Site[] = [
  // ── GLOBAL – Profile ──────────────────────────────────────────────
  { name: "About.me", url: "https://about.me", da: 91, countries: ["global"], category: "Profile" },
  { name: "Gravatar", url: "https://gravatar.com", da: 94, countries: ["global"], category: "Profile" },
  { name: "Flavors.me", url: "https://flavors.me", da: 68, countries: ["global"], category: "Profile" },
  { name: "Redbubble", url: "https://redbubble.com", da: 88, countries: ["global"], category: "Profile" },
  { name: "Naymz", url: "https://naymz.com", da: 51, countries: ["global"], category: "Profile" },
  { name: "Plaxo", url: "https://plaxo.com", da: 72, countries: ["global"], category: "Profile" },

  // ── GLOBAL – Social ────────────────────────────────────────────────
  { name: "LinkedIn", url: "https://linkedin.com", da: 98, countries: ["global"], category: "Social" },
  { name: "Twitter / X", url: "https://x.com", da: 95, countries: ["global"], category: "Social" },
  { name: "Pinterest", url: "https://pinterest.com", da: 94, countries: ["global"], category: "Social" },
  { name: "Reddit", url: "https://reddit.com", da: 96, countries: ["global"], category: "Social" },
  { name: "MySpace", url: "https://myspace.com", da: 90, countries: ["global"], category: "Social" },
  { name: "Minds.com", url: "https://minds.com", da: 76, countries: ["global"], category: "Social" },
  { name: "Goodreads", url: "https://goodreads.com", da: 93, countries: ["global"], category: "Social" },
  { name: "VK.com", url: "https://vk.com", da: 96, countries: ["global"], category: "Social" },
  { name: "Meetup", url: "https://meetup.com", da: 91, countries: ["global"], category: "Social" },
  { name: "XING", url: "https://xing.com", da: 91, countries: ["global"], category: "Social" },
  { name: "Diigo", url: "https://diigo.com", da: 82, countries: ["global"], category: "Social" },
  { name: "Delicious", url: "https://del.icio.us", da: 89, countries: ["global"], category: "Social" },
  { name: "Wattpad", url: "https://wattpad.com", da: 93, countries: ["global"], category: "Social" },
  { name: "Folkd", url: "https://folkd.com", da: 61, countries: ["global"], category: "Social" },
  { name: "Pearltrees", url: "https://pearltrees.com", da: 80, countries: ["global"], category: "Social" },

  // ── GLOBAL – Blog ──────────────────────────────────────────────────
  { name: "WordPress.com", url: "https://wordpress.com", da: 95, countries: ["global"], category: "Blog" },
  { name: "Blogger", url: "https://blogger.com", da: 94, countries: ["global"], category: "Blog" },
  { name: "Tumblr", url: "https://tumblr.com", da: 92, countries: ["global"], category: "Blog" },
  { name: "Medium", url: "https://medium.com", da: 95, countries: ["global"], category: "Blog" },
  { name: "HubPages", url: "https://hubpages.com", da: 88, countries: ["global"], category: "Blog" },
  { name: "Livejournal", url: "https://livejournal.com", da: 91, countries: ["global"], category: "Blog" },
  { name: "Weebly", url: "https://weebly.com", da: 93, countries: ["global"], category: "Blog" },
  { name: "Wix", url: "https://wix.com", da: 95, countries: ["global"], category: "Blog" },
  { name: "Jimdo", url: "https://jimdo.com", da: 87, countries: ["global"], category: "Blog" },
  { name: "Strikingly", url: "https://strikingly.com", da: 83, countries: ["global"], category: "Blog" },
  { name: "Bloglovin", url: "https://bloglovin.com", da: 85, countries: ["global"], category: "Blog" },
  { name: "Angelfire", url: "https://angelfire.com", da: 83, countries: ["global"], category: "Blog" },
  { name: "EzineArticles", url: "https://ezinearticles.com", da: 83, countries: ["global"], category: "Blog" },
  { name: "Zupyak", url: "https://zupyak.com", da: 52, countries: ["global"], category: "Blog" },

  // ── GLOBAL – Forum ─────────────────────────────────────────────────
  { name: "Disqus", url: "https://disqus.com", da: 92, countries: ["global"], category: "Forum" },
  { name: "Quora", url: "https://quora.com", da: 93, countries: ["global"], category: "Forum" },
  { name: "Warrior Forum", url: "https://warriorforum.com", da: 72, countries: ["global"], category: "Forum" },
  { name: "DigitalPoint", url: "https://digitalpoint.com", da: 68, countries: ["global"], category: "Forum" },
  { name: "WebmasterWorld", url: "https://webmasterworld.com", da: 74, countries: ["global"], category: "Forum" },
  { name: "Intensedebate", url: "https://intensedebate.com", da: 81, countries: ["global"], category: "Forum" },

  // ── GLOBAL – Dev ───────────────────────────────────────────────────
  { name: "GitHub", url: "https://github.com", da: 96, countries: ["global"], category: "Dev" },
  { name: "Stack Overflow", url: "https://stackoverflow.com", da: 95, countries: ["global"], category: "Dev" },
  { name: "GitLab", url: "https://gitlab.com", da: 95, countries: ["global"], category: "Dev" },
  { name: "Replit", url: "https://replit.com", da: 88, countries: ["global"], category: "Dev" },
  { name: "DZone", url: "https://dzone.com", da: 83, countries: ["global"], category: "Dev" },
  { name: "Sitepoint", url: "https://sitepoint.com", da: 89, countries: ["global"], category: "Dev" },
  { name: "Codecademy", url: "https://codecademy.com", da: 91, countries: ["global"], category: "Dev" },
  { name: "Kaggle", url: "https://kaggle.com", da: 87, countries: ["global"], category: "Dev" },

  // ── GLOBAL – Creative ──────────────────────────────────────────────
  { name: "Behance", url: "https://behance.net", da: 93, countries: ["global"], category: "Creative" },
  { name: "Dribbble", url: "https://dribbble.com", da: 91, countries: ["global"], category: "Creative" },
  { name: "Deviantart", url: "https://deviantart.com", da: 93, countries: ["global"], category: "Creative" },
  { name: "ArtStation", url: "https://artstation.com", da: 84, countries: ["global"], category: "Creative" },
  { name: "Canva", url: "https://canva.com", da: 93, countries: ["global"], category: "Creative" },
  { name: "99designs", url: "https://99designs.com", da: 87, countries: ["global"], category: "Creative" },
  { name: "Envato", url: "https://envato.com", da: 90, countries: ["global"], category: "Creative" },
  { name: "Creative Market", url: "https://creativemarket.com", da: 86, countries: ["global"], category: "Creative" },
  { name: "Houzz", url: "https://houzz.com", da: 91, countries: ["global"], category: "Creative" },
  { name: "Carbonmade", url: "https://carbonmade.com", da: 78, countries: ["global"], category: "Creative" },

  // ── GLOBAL – Media ─────────────────────────────────────────────────
  { name: "Flickr", url: "https://flickr.com", da: 93, countries: ["global"], category: "Media" },
  { name: "Vimeo", url: "https://vimeo.com", da: 96, countries: ["global"], category: "Media" },
  { name: "SoundCloud", url: "https://soundcloud.com", da: 93, countries: ["global"], category: "Media" },
  { name: "500px", url: "https://500px.com", da: 87, countries: ["global"], category: "Media" },
  { name: "Last.fm", url: "https://last.fm", da: 92, countries: ["global"], category: "Media" },
  { name: "Bandcamp", url: "https://bandcamp.com", da: 90, countries: ["global"], category: "Media" },
  { name: "SmugMug", url: "https://smugmug.com", da: 88, countries: ["global"], category: "Media" },
  { name: "Unsplash", url: "https://unsplash.com", da: 90, countries: ["global"], category: "Media" },

  // ── GLOBAL – Content ───────────────────────────────────────────────
  { name: "Scribd", url: "https://scribd.com", da: 94, countries: ["global"], category: "Content" },
  { name: "Slideshare", url: "https://slideshare.net", da: 94, countries: ["global"], category: "Content" },
  { name: "Issuu", url: "https://issuu.com", da: 91, countries: ["global"], category: "Content" },
  { name: "Evernote", url: "https://evernote.com", da: 92, countries: ["global"], category: "Content" },
  { name: "Pocket", url: "https://getpocket.com", da: 90, countries: ["global"], category: "Content" },
  { name: "Feedly", url: "https://feedly.com", da: 89, countries: ["global"], category: "Content" },
  { name: "Scoop.it", url: "https://scoop.it", da: 83, countries: ["global"], category: "Content" },
  { name: "Netvibes", url: "https://netvibes.com", da: 84, countries: ["global"], category: "Content" },
  { name: "Google Sites", url: "https://sites.google.com", da: 94, countries: ["global"], category: "Content" },
  { name: "Internet Archive", url: "https://archive.org", da: 94, countries: ["global"], category: "Content" },
  { name: "Paper.li", url: "https://paper.li", da: 78, countries: ["global"], category: "Content" },

  // ── GLOBAL – Business ──────────────────────────────────────────────
  { name: "Crunchbase", url: "https://crunchbase.com", da: 91, countries: ["global"], category: "Business" },
  { name: "AngelList", url: "https://angel.co", da: 90, countries: ["global"], category: "Business" },
  { name: "ProductHunt", url: "https://producthunt.com", da: 89, countries: ["global"], category: "Business" },
  { name: "G2", url: "https://g2.com", da: 87, countries: ["global"], category: "Business" },
  { name: "Capterra", url: "https://capterra.com", da: 87, countries: ["global"], category: "Business" },
  { name: "Clutch.co", url: "https://clutch.co", da: 83, countries: ["global"], category: "Business" },
  { name: "Glassdoor", url: "https://glassdoor.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Indeed", url: "https://indeed.com", da: 93, countries: ["global"], category: "Business" },
  { name: "Upwork", url: "https://upwork.com", da: 92, countries: ["global"], category: "Business" },
  { name: "Fiverr", url: "https://fiverr.com", da: 93, countries: ["global"], category: "Business" },
  { name: "Freelancer", url: "https://freelancer.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Toptal", url: "https://toptal.com", da: 87, countries: ["global"], category: "Business" },
  { name: "Guru.com", url: "https://guru.com", da: 80, countries: ["global"], category: "Business" },
  { name: "Trustpilot", url: "https://trustpilot.com", da: 92, countries: ["global"], category: "Business" },
  { name: "Etsy", url: "https://etsy.com", da: 93, countries: ["global"], category: "Business" },
  { name: "Eventbrite", url: "https://eventbrite.com", da: 93, countries: ["global"], category: "Business" },
  { name: "APSense", url: "https://apsense.com", da: 75, countries: ["global"], category: "Business" },
  { name: "ZoomInfo", url: "https://zoominfo.com", da: 72, countries: ["global"], category: "Business" },
  { name: "Storeboard", url: "https://storeboard.com", da: 56, countries: ["global"], category: "Business" },
  { name: "Bizpages", url: "https://bizpages.org", da: 53, countries: ["global"], category: "Business" },
  { name: "StartUs", url: "https://startus.cc", da: 53, countries: ["global"], category: "Business" },
  { name: "2FindLocal", url: "https://2findlocal.com", da: 46, countries: ["global"], category: "Business" },
  { name: "Brownbook", url: "https://brownbook.net", da: 63, countries: ["global"], category: "Business" },
  { name: "Cylex Global", url: "https://cylex.com", da: 62, countries: ["global"], category: "Business" },
  { name: "Hotfrog Global", url: "https://hotfrog.com", da: 64, countries: ["global"], category: "Business" },
  { name: "Yellow Place", url: "https://yellow.place", da: 48, countries: ["global"], category: "Business" },
  { name: "Cybo", url: "https://cybo.com", da: 51, countries: ["global"], category: "Business" },
  { name: "B2BMap", url: "https://b2bmap.com", da: 44, countries: ["global"], category: "Business" },

  // ── GLOBAL – Education ─────────────────────────────────────────────
  { name: "Academia.edu", url: "https://academia.edu", da: 92, countries: ["global"], category: "Education" },
  { name: "ResearchGate", url: "https://researchgate.net", da: 93, countries: ["global"], category: "Education" },
  { name: "Coursera", url: "https://coursera.org", da: 92, countries: ["global"], category: "Education" },
  { name: "Udemy", url: "https://udemy.com", da: 93, countries: ["global"], category: "Education" },

  // ── GLOBAL – Directory / Local ─────────────────────────────────────
  { name: "Foursquare", url: "https://foursquare.com", da: 93, countries: ["global"], category: "Directory" },
  { name: "TripAdvisor", url: "https://tripadvisor.com", da: 93, countries: ["global"], category: "Directory" },
  { name: "Yelp", url: "https://yelp.com", da: 93, countries: ["global"], category: "Directory" },
  { name: "Moz Community", url: "https://moz.com/community", da: 91, countries: ["global"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── BANGLADESH ────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════

  // BD – Business Directories
  { name: "Bangladesh Yellow Book", url: "http://www.bangladeshyellowbook.com", da: 68, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh Info (20m)", url: "http://bangladeshinfo.20m.com", da: 64, countries: ["bd"], category: "Directory" },
  { name: "BD Kompass", url: "https://bd.kompass.com", da: 65, countries: ["bd"], category: "Business" },
  { name: "Address Book BD", url: "http://addressbook.com.bd", da: 63, countries: ["bd"], category: "Directory" },
  { name: "BDNews24 Classifieds", url: "https://bdnews24.com/classifieds", da: 72, countries: ["bd"], category: "Classifieds" },
  { name: "BD Yellow Pages Net", url: "http://www.bdyellowpages.net", da: 56, countries: ["bd"], category: "Directory" },
  { name: "List Point BD", url: "https://www.listpointbd.com", da: 53, countries: ["bd"], category: "Directory" },
  { name: "Khoj Korun", url: "https://khojkorun.com", da: 53, countries: ["bd"], category: "Directory" },
  { name: "BizHwy BD", url: "https://bizhwy.com", da: 51, countries: ["bd"], category: "Directory" },
  { name: "BD Yellow Pages", url: "https://bdyellowpages.com.bd", da: 38, countries: ["bd"], category: "Directory" },
  { name: "BG Yellow Pages", url: "http://www.bgyellowpages.com", da: 41, countries: ["bd"], category: "Directory" },
  { name: "BD Trade Info", url: "http://www.bdtradeinfo.com", da: 42, countries: ["bd"], category: "Business" },
  { name: "BD Talika", url: "https://bdtalika.com", da: 40, countries: ["bd"], category: "Directory" },
  { name: "Address Bazar", url: "http://www.addressbazar.com", da: 40, countries: ["bd"], category: "Directory" },
  { name: "Moumachi BD", url: "https://moumachi.com.bd", da: 43, countries: ["bd"], category: "Directory" },
  { name: "Bangla 2000", url: "http://www.bangla2000.com", da: 47, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh Trades", url: "http://www.bangladeshtrades.com", da: 39, countries: ["bd"], category: "Business" },
  { name: "Bangladesh Dir", url: "http://www.bangladeshdir.com", da: 39, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh Business Dir", url: "http://bangladeshbusinessdir.com", da: 37, countries: ["bd"], category: "Business" },
  { name: "Bangladesh Seek", url: "http://www.bangladeshseek.com", da: 35, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh Circle", url: "http://www.bangladeshcircle.com", da: 33, countries: ["bd"], category: "Community" },
  { name: "Bangladesh Info", url: "http://bangladeshinfo.com", da: 36, countries: ["bd"], category: "Directory" },
  { name: "Enroll Business BD", url: "https://bd.enrollbusiness.com", da: 47, countries: ["bd"], category: "Business" },
  { name: "Bangla Web", url: "http://banglaweb.com", da: 26, countries: ["bd"], category: "Directory" },
  { name: "Biz Bangladesh", url: "https://bizbangladesh.com", da: 38, countries: ["bd"], category: "Business" },
  { name: "Prantor", url: "http://www.prantor.com", da: 24, countries: ["bd"], category: "Business" },
  { name: "BD Query", url: "http://www.bdquery.com", da: 23, countries: ["bd"], category: "Directory" },
  { name: "White Pages BD", url: "https://whitepagesbd.com", da: 21, countries: ["bd"], category: "Directory" },
  { name: "BD Home 24", url: "https://www.bdhome24.com", da: 21, countries: ["bd"], category: "Business" },
  { name: "Tuugo BD", url: "https://www.tuugo.com.bd", da: 16, countries: ["bd"], category: "Directory" },
  { name: "InfoIsInfo BD", url: "https://www.infoisinfo.com.bd", da: 15, countries: ["bd"], category: "Directory" },
  { name: "Moumaachi", url: "https://www.moumaachi.com", da: 15, countries: ["bd"], category: "Directory" },
  { name: "Yalwa BD", url: "https://www.yalwa.com.bd", da: 14, countries: ["bd"], category: "Directory" },
  { name: "GBIBP Bangladesh", url: "https://www.gbibp.com/bangladesh", da: 17, countries: ["bd"], category: "Business" },
  { name: "Deshi Yellow Pages", url: "http://www.deshiyellowpages.com", da: 13, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh YP", url: "http://www.bangladeshyp.com", da: 27, countries: ["bd"], category: "Directory" },
  { name: "Bangladesh Point", url: "http://www.bangladeshpoint.com", da: 28, countries: ["bd"], category: "Directory" },
  { name: "BD Business Info", url: "https://bdbusinessinfo.com", da: 12, countries: ["bd"], category: "Business" },
  { name: "Allofbd", url: "https://allofbd.com", da: 20, countries: ["bd"], category: "Directory" },
  { name: "TopinBD", url: "https://topinbd.com", da: 22, countries: ["bd"], category: "Directory" },
  { name: "Kagoz", url: "https://kagoz.com", da: 18, countries: ["bd"], category: "Directory" },
  { name: "Reviewro BD", url: "https://reviewro.com", da: 22, countries: ["bd"], category: "Directory" },
  { name: "AddressMart BD", url: "https://addressmart.com", da: 19, countries: ["bd"], category: "Business" },
  { name: "BD Find", url: "https://www.bdfind.com", da: 18, countries: ["bd"], category: "Directory" },
  { name: "BD Business Online", url: "https://bdbusinessonline.com", da: 30, countries: ["bd"], category: "Business" },
  { name: "Bangladesh Directory", url: "http://bangladeshidirectory.com", da: 42, countries: ["bd"], category: "Directory" },
  { name: "Abo Homan Bangla", url: "http://abohomanbangla.com", da: 41, countries: ["bd"], category: "Directory" },
  { name: "Yog Sutra BD", url: "https://www.yogsutra.com", da: 36, countries: ["bd"], category: "Directory" },
  { name: "E-Trade Listing", url: "http://www.etradelisting.com", da: 31, countries: ["bd"], category: "Directory" },
  { name: "Web Directories BD", url: "http://www.web-directories.ws/Regional/Asia/Bangladesh", da: 31, countries: ["bd"], category: "Directory" },
  { name: "Address BD", url: "http://addressbd.net", da: 25, countries: ["bd"], category: "Directory" },
  { name: "Dhaka Snob", url: "http://dhakasnob.com", da: 25, countries: ["bd"], category: "Directory" },
  { name: "Banglasites", url: "http://www.banglasites.com", da: 14, countries: ["bd"], category: "Directory" },
  { name: "BD Websites", url: "http://www.bdwebsites.com", da: 19, countries: ["bd"], category: "Directory" },
  { name: "Green Data BD", url: "http://greendata.com.bd", da: 12, countries: ["bd"], category: "Directory" },
  { name: "Prekkha", url: "https://prekkha.com", da: 6, countries: ["bd"], category: "Directory" },
  { name: "WP Group BD", url: "https://wpgroupbd.com", da: 19, countries: ["bd"], category: "Directory" },
  { name: "Trade Bangla", url: "http://www.tradebangla.com.bd", da: 23, countries: ["bd"], category: "Business" },
  { name: "BGDLink", url: "https://bgdlink.com", da: 18, countries: ["bd"], category: "Directory" },
  { name: "BD Directories", url: "https://bddirectories.com", da: 16, countries: ["bd"], category: "Directory" },
  { name: "BD Mart Info", url: "https://bdmartinfo.com", da: 14, countries: ["bd"], category: "Directory" },
  { name: "Fyple BD", url: "https://fyple.biz/Bangladesh", da: 30, countries: ["bd"], category: "Directory" },
  { name: "Acompio BD", url: "https://acompio.com/Bangladesh", da: 28, countries: ["bd"], category: "Directory" },
  { name: "Find-Us-Here BD", url: "https://find-us-here.com/businesses/Bangladesh", da: 32, countries: ["bd"], category: "Directory" },
  { name: "Yellow Place BD", url: "https://yellow.place/en/bangladesh", da: 48, countries: ["bd"], category: "Directory" },
  { name: "Cybo BD", url: "https://www.cybo.com/BD", da: 51, countries: ["bd"], category: "Directory" },
  { name: "BizPages BD", url: "https://bizpages.org/countries--BD--Bangladesh", da: 53, countries: ["bd"], category: "Directory" },
  { name: "Biz PRLog BD", url: "https://biz.prlog.org/bd", da: 81, countries: ["bd"], category: "Business" },
  { name: "NGOBase Bangladesh", url: "https://ngobase.org/c/BD/bangladesh-ngos-charities", da: 35, countries: ["bd"], category: "Directory" },

  // BD – Classifieds
  { name: "Bikroy", url: "https://bikroy.com", da: 55, countries: ["bd"], category: "Classifieds" },
  { name: "ClickBD", url: "https://www.clickbd.com", da: 49, countries: ["bd"], category: "Classifieds" },
  { name: "OLX Bangladesh", url: "https://www.olx.com.bd", da: 58, countries: ["bd"], category: "Classifieds" },
  { name: "Locanto BD", url: "https://www.locanto.com.bd", da: 19, countries: ["bd"], category: "Classifieds" },
  { name: "Bangladesh Craigslist", url: "https://bangladesh.craigslist.org", da: 89, countries: ["bd"], category: "Classifieds" },
  { name: "Global Free Classifieds BD", url: "https://bangladesh.global-free-classified-ads.com", da: 46, countries: ["bd"], category: "Classifieds" },
  { name: "Cell Bazar", url: "https://cellbazaar.com", da: 35, countries: ["bd"], category: "Classifieds" },
  { name: "BProperty", url: "https://www.bproperty.com", da: 42, countries: ["bd"], category: "Classifieds" },
  { name: "Expatads BD", url: "https://www.expatads.com/66-Bangladesh", da: 42, countries: ["bd"], category: "Classifieds" },
  { name: "Lamudi BD", url: "https://www.lamudi.com.bd", da: 30, countries: ["bd"], category: "Classifieds" },
  { name: "Notun Bazar", url: "https://notunbazar.com", da: 30, countries: ["bd"], category: "Classifieds" },
  { name: "Free Ads Time BD", url: "https://bangladesh.freeadstime.org", da: 34, countries: ["bd"], category: "Classifieds" },
  { name: "Ad Hoards BD", url: "http://bangladesh.adhoards.com", da: 25, countries: ["bd"], category: "Classifieds" },
  { name: "Quikads BD", url: "https://www.quikads.com.bd", da: 28, countries: ["bd"], category: "Classifieds" },
  { name: "Apnar Deal", url: "https://apnardeal.com", da: 21, countries: ["bd"], category: "Classifieds" },
  { name: "Big Page BD", url: "https://bigpage.com.bd", da: 16, countries: ["bd"], category: "Classifieds" },
  { name: "Adsark BD", url: "https://adsark.com/-20-Bangladesh", da: 22, countries: ["bd"], category: "Classifieds" },
  { name: "Adsno1 BD", url: "http://adsno1.com/bangladesh", da: 19, countries: ["bd"], category: "Classifieds" },
  { name: "Click Dhaka", url: "https://clickdhaka.com", da: 20, countries: ["bd"], category: "Classifieds" },
  { name: "Scroll List BD", url: "https://scrolllist.com/Bangladesh", da: 18, countries: ["bd"], category: "Classifieds" },
  { name: "Ad Bazar BD", url: "https://adbazarbd.com", da: 18, countries: ["bd"], category: "Classifieds" },
  { name: "Sale Market BD", url: "https://salemarketbd.com", da: 15, countries: ["bd"], category: "Classifieds" },
  { name: "Bikri BD", url: "https://bikribd.com", da: 22, countries: ["bd"], category: "Classifieds" },
  { name: "Hello BD", url: "https://www.hellobd.com.bd", da: 7, countries: ["bd"], category: "Classifieds" },
  { name: "89 Classifieds BD", url: "https://bd.89classifieds.com", da: 12, countries: ["bd"], category: "Classifieds" },
  { name: "BD Hut Bazar", url: "https://bdhutbazar.com", da: 10, countries: ["bd"], category: "Classifieds" },
  { name: "BD Sellers", url: "https://bdsellers.com", da: 12, countries: ["bd"], category: "Classifieds" },
  { name: "Garirbazar", url: "https://www.garirbazar.com", da: 35, countries: ["bd"], category: "Classifieds" },
  { name: "Car Buy Sell BD", url: "https://carbuysell.com.bd", da: 25, countries: ["bd"], category: "Classifieds" },

  // BD – Blog & Community
  { name: "Somewhere In Blog", url: "https://www.somewhereinblog.net", da: 60, countries: ["bd"], category: "Blog" },
  { name: "BDnews24 Blog", url: "https://blog.bdnews24.com", da: 64, countries: ["bd"], category: "Blog" },
  { name: "Sachalayatan", url: "http://www.sachalayatan.com", da: 50, countries: ["bd"], category: "Blog" },
  { name: "Techtunes", url: "https://techtunes.tech", da: 55, countries: ["bd"], category: "Blog" },
  { name: "TrickBD", url: "https://trickbd.com", da: 52, countries: ["bd"], category: "Blog" },
  { name: "Bangla Hub", url: "https://banglahub.com.bd", da: 40, countries: ["bd"], category: "Blog" },
  { name: "Tarunyo", url: "https://www.tarunyo.com", da: 35, countries: ["bd"], category: "Blog" },
  { name: "Anytechtune", url: "https://anytechtune.com", da: 35, countries: ["bd"], category: "Blog" },
  { name: "Tech and Teen BD", url: "https://www.techandteen.com", da: 32, countries: ["bd"], category: "Blog" },
  { name: "Biggani", url: "http://biggani.org", da: 30, countries: ["bd"], category: "Blog" },
  { name: "Cadet College Blog", url: "http://www.cadetcollegeblog.com", da: 32, countries: ["bd"], category: "Blog" },
  { name: "Trixbd", url: "https://trixbd.com", da: 28, countries: ["bd"], category: "Blog" },

  // BD – Forums
  { name: "SkyscraperCity BD", url: "https://www.skyscrapercity.com/forums/bangladesh", da: 80, countries: ["bd"], category: "Forum" },
  { name: "Projanmo Forum", url: "https://forum.projanmo.com", da: 45, countries: ["bd"], category: "Forum" },
  { name: "Bengali Forum", url: "https://bengaliforum.com", da: 28, countries: ["bd"], category: "Forum" },
  { name: "Bangla Forum", url: "https://banglaforum.net", da: 25, countries: ["bd"], category: "Forum" },
  { name: "Shodalap", url: "http://shodalap.org", da: 25, countries: ["bd"], category: "Forum" },
  { name: "Bangladesh Unity Forum", url: "https://bangladeshunityforum.org", da: 22, countries: ["bd"], category: "Forum" },
  { name: "Bright Bangladesh Forum", url: "https://brightbangladeshforum.org", da: 20, countries: ["bd"], category: "Forum" },

  // BD – Jobs
  { name: "BDjobs", url: "https://bdjobs.com", da: 52, countries: ["bd"], category: "Jobs" },
  { name: "Prothom Alo Jobs", url: "https://jobs.prothomalo.com", da: 72, countries: ["bd"], category: "Jobs" },
  { name: "Chakri.com", url: "https://www.chakri.com", da: 45, countries: ["bd"], category: "Jobs" },
  { name: "Skill Jobs", url: "https://skill.jobs", da: 44, countries: ["bd"], category: "Jobs" },
  { name: "Shomvob", url: "https://shomvob.com", da: 40, countries: ["bd"], category: "Jobs" },
  { name: "Alljobsbd", url: "https://alljobs.com.bd", da: 40, countries: ["bd"], category: "Jobs" },
  { name: "eJobs BD", url: "https://www.ejobs.com.bd", da: 38, countries: ["bd"], category: "Jobs" },
  { name: "BDJobsToday", url: "https://www.bdjobstoday.com", da: 35, countries: ["bd"], category: "Jobs" },
  { name: "NRB Jobs", url: "https://nrbjobs.com", da: 32, countries: ["bd"], category: "Jobs" },
  { name: "BD Jobs Live", url: "https://bdjobslive.com", da: 30, countries: ["bd"], category: "Jobs" },
  { name: "Chakrirkhobor", url: "https://chakrirkhobor.net", da: 30, countries: ["bd"], category: "Jobs" },
  { name: "Job.com.bd", url: "https://job.com.bd", da: 28, countries: ["bd"], category: "Jobs" },
  { name: "Uncareer BD", url: "https://uncareer.com/bangladesh", da: 25, countries: ["bd"], category: "Jobs" },

  // BD – E-Commerce / Marketplace
  { name: "Daraz BD", url: "https://www.daraz.com.bd", da: 57, countries: ["bd"], category: "E-Commerce" },
  { name: "Rokomari", url: "https://rokomari.com", da: 50, countries: ["bd"], category: "E-Commerce" },
  { name: "Chaldal", url: "https://chaldal.com", da: 45, countries: ["bd"], category: "E-Commerce" },
  { name: "Pathao", url: "https://pathao.com", da: 46, countries: ["bd"], category: "E-Commerce" },
  { name: "Ajkerdeal", url: "https://www.ajkerdeal.com", da: 47, countries: ["bd"], category: "E-Commerce" },
  { name: "Priyoshop", url: "https://priyoshop.com", da: 43, countries: ["bd"], category: "E-Commerce" },
  { name: "Shajgoj", url: "https://www.shajgoj.com", da: 42, countries: ["bd"], category: "E-Commerce" },
  { name: "Shohoz", url: "https://shohoz.com", da: 44, countries: ["bd"], category: "E-Commerce" },
  { name: "Sohoz", url: "https://sohoz.com", da: 41, countries: ["bd"], category: "E-Commerce" },
  { name: "Othoba", url: "https://www.othoba.com", da: 42, countries: ["bd"], category: "E-Commerce" },
  { name: "Sindabad", url: "https://sindabad.com", da: 40, countries: ["bd"], category: "E-Commerce" },
  { name: "Pickaboo", url: "https://www.pickaboo.com", da: 45, countries: ["bd"], category: "E-Commerce" },
  { name: "Star Tech BD", url: "https://www.startech.com.bd", da: 50, countries: ["bd"], category: "E-Commerce" },
  { name: "Ryans Computers", url: "https://www.ryans.com", da: 45, countries: ["bd"], category: "E-Commerce" },
  { name: "Gadget and Gear BD", url: "https://gadgetandgear.com", da: 38, countries: ["bd"], category: "E-Commerce" },
  { name: "Shwapno Online", url: "https://www.shwapno.com", da: 38, countries: ["bd"], category: "E-Commerce" },
  { name: "Arogga", url: "https://www.arogga.com", da: 36, countries: ["bd"], category: "E-Commerce" },
  { name: "Shodagor", url: "https://shodagor.com", da: 35, countries: ["bd"], category: "E-Commerce" },
  { name: "Fabrilife", url: "https://fabrilife.com", da: 35, countries: ["bd"], category: "E-Commerce" },
  { name: "Go Zayaan", url: "https://gozayaan.com", da: 38, countries: ["bd"], category: "E-Commerce" },
  { name: "Khaas Food", url: "https://www.khaasfood.com", da: 32, countries: ["bd"], category: "E-Commerce" },
  { name: "Boibazar", url: "https://www.boibazar.com", da: 28, countries: ["bd"], category: "E-Commerce" },
  { name: "Rockmari", url: "https://rockmari.com", da: 25, countries: ["bd"], category: "E-Commerce" },
  { name: "Baatighar", url: "https://www.baatighar.com", da: 22, countries: ["bd"], category: "E-Commerce" },
  { name: "ShareTrip BD", url: "https://www.sharetrip.net", da: 42, countries: ["bd"], category: "E-Commerce" },

  // BD – News / Community
  { name: "BDNews24", url: "https://bdnews24.com", da: 72, countries: ["bd"], category: "News" },
  { name: "Prothom Alo", url: "https://www.prothomalo.com", da: 70, countries: ["bd"], category: "News" },
  { name: "Daily Star BD", url: "https://www.thedailystar.net", da: 75, countries: ["bd"], category: "News" },
  { name: "Dhaka Tribune", url: "https://www.dhakatribune.com", da: 68, countries: ["bd"], category: "News" },
  { name: "Bangla Tribune", url: "https://www.banglatribune.com", da: 62, countries: ["bd"], category: "News" },
  { name: "Financial Express BD", url: "https://thefinancialexpress.com.bd", da: 60, countries: ["bd"], category: "News" },
  { name: "Daily Sun BD", url: "https://www.daily-sun.com", da: 58, countries: ["bd"], category: "News" },
  { name: "New Age BD", url: "https://www.newagebd.net", da: 57, countries: ["bd"], category: "News" },
  { name: "Jagonews24", url: "https://www.jagonews24.com", da: 55, countries: ["bd"], category: "News" },
  { name: "Samakal", url: "https://samakal.com", da: 55, countries: ["bd"], category: "News" },
  { name: "Jugantor", url: "https://www.jugantor.com", da: 53, countries: ["bd"], category: "News" },
  { name: "Kaler Kantho", url: "https://www.kalerkantho.com", da: 52, countries: ["bd"], category: "News" },
  { name: "RisingBD", url: "https://www.risingbd.com", da: 50, countries: ["bd"], category: "News" },
  { name: "Bangla News 24", url: "https://www.banglanews24.com", da: 50, countries: ["bd"], category: "News" },
  { name: "Ittefaq", url: "https://www.ittefaq.com.bd", da: 52, countries: ["bd"], category: "News" },
  { name: "Daily Bangladesh", url: "https://www.daily-bangladesh.com", da: 45, countries: ["bd"], category: "News" },
  { name: "The Dhaka Post", url: "https://thedhakapost.com", da: 42, countries: ["bd"], category: "News" },
  { name: "Manab Zamin", url: "https://mzamin.com", da: 48, countries: ["bd"], category: "News" },

  // BD – Community
  { name: "Bangladesh.com", url: "https://bangladesh.com", da: 48, countries: ["bd"], category: "Community" },
  { name: "Expat.com BD", url: "https://www.expat.com/en/destination/asia/bangladesh", da: 70, countries: ["bd"], category: "Community" },
  { name: "Bangladesh Circle Community", url: "https://www.bangladeshcircle.com", da: 33, countries: ["bd"], category: "Community" },
  { name: "Bongodesh", url: "https://bongodesh.com", da: 25, countries: ["bd"], category: "Community" },
  { name: "Bangladesh.net.bd", url: "https://bangladesh.net.bd", da: 28, countries: ["bd"], category: "Community" },

  // BD – B2B / Trade
  { name: "BD Trade Info YP", url: "http://www.bdtradeinfo.com/yellowpages", da: 42, countries: ["bd"], category: "Business" },
  { name: "Go4WorldBusiness BD", url: "https://www.go4worldbusiness.com/bangladesh", da: 38, countries: ["bd"], category: "Business" },
  { name: "Connect2India BD", url: "https://connect2india.com/global/company-directory/companies-in-Bangladesh", da: 26, countries: ["bd"], category: "Business" },
  { name: "ExportersBD", url: "https://exportersbd.com", da: 32, countries: ["bd"], category: "Business" },
  { name: "TradeWheel BD", url: "https://www.tradewheel.com/bangladesh", da: 40, countries: ["bd"], category: "Business" },
  { name: "ExportHub BD", url: "https://www.exporthub.com/bangladesh", da: 38, countries: ["bd"], category: "Business" },
  { name: "B2BMap BD", url: "https://b2bmap.com/bangladesh", da: 44, countries: ["bd"], category: "Business" },
  { name: "BanglaRMG", url: "https://www.banglarmg.com", da: 35, countries: ["bd"], category: "Business" },
  { name: "BGMEA", url: "https://www.bgmea.com.bd", da: 48, countries: ["bd"], category: "Business" },
  { name: "Bangladesh B2B", url: "https://bangladeshb2b.com", da: 25, countries: ["bd"], category: "Business" },
  { name: "BD Manufacturer", url: "https://bdmanufacturer.com", da: 22, countries: ["bd"], category: "Business" },
  { name: "Garment Directory BD", url: "http://garmentdirectory.com", da: 13, countries: ["bd"], category: "Business" },
  { name: "BD Trade", url: "https://bdtrade.com.bd", da: 20, countries: ["bd"], category: "Business" },
  { name: "Entrepreneur SME Asia BD", url: "http://entrepreneur-sme.asia/business-directory/bangladesh", da: 26, countries: ["bd"], category: "Business" },

  // BD – Health / Medical
  { name: "Bangladesh Doctor", url: "http://bangladeshdoctor.com", da: 30, countries: ["bd"], category: "Directory" },
  { name: "Medical Directory BD", url: "https://medicaldirectorybd.com", da: 22, countries: ["bd"], category: "Directory" },
  { name: "Healtha.io BD", url: "https://healtha.io", da: 28, countries: ["bd"], category: "Directory" },
  { name: "Doctors Directory BD", url: "https://doctorsdirectory.com.bd", da: 20, countries: ["bd"], category: "Directory" },
  { name: "Arogga Pharmacy", url: "https://www.arogga.com", da: 36, countries: ["bd"], category: "Directory" },
  { name: "MedEasy BD", url: "https://medeasy.health", da: 30, countries: ["bd"], category: "Directory" },

  // BD – Legal
  { name: "PathLegal BD", url: "https://bd.pathlegal.com", da: 38, countries: ["bd"], category: "Directory" },
  { name: "Lawyer Listify BD", url: "https://lawyerlistify.com/bangladesh", da: 30, countries: ["bd"], category: "Directory" },

  // BD – Automotive
  { name: "MotorGuide BD", url: "https://motorguide.com.bd", da: 22, countries: ["bd"], category: "Directory" },
  { name: "Car Selection BD", url: "https://carselectionbd.com", da: 18, countries: ["bd"], category: "Directory" },

  // BD – Travel / Tourism
  { name: "Visit Bangladesh", url: "https://visitbangladesh.com.bd", da: 40, countries: ["bd"], category: "Directory" },
  { name: "Travel Mate BD", url: "https://www.travelmate.com.bd", da: 25, countries: ["bd"], category: "Directory" },

  // BD – Logistics / Delivery
  { name: "Steadfast Courier BD", url: "https://steadfast.com.bd", da: 35, countries: ["bd"], category: "Business" },
  { name: "Paperfly BD", url: "https://paperfly.com.bd", da: 32, countries: ["bd"], category: "Business" },
  { name: "eCourier BD", url: "https://ecourier.com.bd", da: 30, countries: ["bd"], category: "Business" },
  { name: "RedX BD", url: "https://redx.com.bd", da: 38, countries: ["bd"], category: "Business" },

  // BD – Property / Real Estate
  { name: "BD Housing", url: "https://www.bdhousing.com", da: 35, countries: ["bd"], category: "Directory" },
  { name: "Property Finder BD", url: "https://propertyfinderbd.com", da: 22, countries: ["bd"], category: "Directory" },

  // BD – Tech Blogs
  { name: "Techlife BD", url: "https://techlife.com.bd", da: 28, countries: ["bd"], category: "Blog" },
  { name: "Techworld BD", url: "https://techworldbd24.com", da: 24, countries: ["bd"], category: "Blog" },

  // BD – Food
  { name: "Foodpanda BD", url: "https://www.foodpanda.com.bd", da: 55, countries: ["bd"], category: "Directory" },
  { name: "FoodieBD", url: "https://foodibd.com", da: 20, countries: ["bd"], category: "Community" },

  // ── USA ────────────────────────────────────────────────────────────
  { name: "Yellow Pages US", url: "https://yellowpages.com", da: 88, countries: ["us"], category: "Directory" },
  { name: "Angi", url: "https://angi.com", da: 88, countries: ["us"], category: "Directory" },
  { name: "Superpages", url: "https://superpages.com", da: 78, countries: ["us"], category: "Directory" },
  { name: "Whitepages", url: "https://whitepages.com", da: 80, countries: ["us"], category: "Directory" },
  { name: "Thumbtack", url: "https://thumbtack.com", da: 84, countries: ["us"], category: "Directory" },
  { name: "Merchant Circle", url: "https://merchantcircle.com", da: 72, countries: ["us"], category: "Business" },
  { name: "Manta", url: "https://manta.com", da: 79, countries: ["us"], category: "Business" },
  { name: "Citysearch", url: "https://citysearch.com", da: 75, countries: ["us"], category: "Directory" },
  { name: "DexKnows", url: "https://dexknows.com", da: 63, countries: ["us"], category: "Directory" },
  { name: "Local.com", url: "https://local.com", da: 71, countries: ["us"], category: "Directory" },
  { name: "MapQuest", url: "https://mapquest.com", da: 88, countries: ["us"], category: "Directory" },
  { name: "HomeAdvisor", url: "https://homeadvisor.com", da: 85, countries: ["us"], category: "Directory" },

  // ── UK ─────────────────────────────────────────────────────────────
  { name: "Yell.com", url: "https://yell.com", da: 85, countries: ["uk"], category: "Directory" },
  { name: "Thomson Local", url: "https://thomsonlocal.com", da: 70, countries: ["uk"], category: "Directory" },
  { name: "FreeIndex", url: "https://freeindex.co.uk", da: 59, countries: ["uk"], category: "Directory" },
  { name: "Yelp UK", url: "https://yelp.co.uk", da: 88, countries: ["uk"], category: "Directory" },
  { name: "Hotfrog UK", url: "https://hotfrog.co.uk", da: 60, countries: ["uk"], category: "Directory" },
  { name: "Scoot", url: "https://scoot.co.uk", da: 62, countries: ["uk"], category: "Directory" },
  { name: "Business Magnet", url: "https://businessmagnet.co.uk", da: 44, countries: ["uk"], category: "Directory" },
  { name: "Bark UK", url: "https://bark.com", da: 72, countries: ["uk"], category: "Business" },

  // ── India ──────────────────────────────────────────────────────────
  { name: "IndiaMART", url: "https://indiamart.com", da: 74, countries: ["in"], category: "Business" },
  { name: "Justdial", url: "https://justdial.com", da: 76, countries: ["in"], category: "Directory" },
  { name: "Sulekha", url: "https://sulekha.com", da: 67, countries: ["in"], category: "Directory" },
  { name: "TradeIndia", url: "https://tradeindia.com", da: 66, countries: ["in"], category: "Business" },
  { name: "Hotfrog India", url: "https://hotfrog.in", da: 56, countries: ["in"], category: "Directory" },
  { name: "Clickindia", url: "https://clickindia.com", da: 53, countries: ["in"], category: "Directory" },
  { name: "Indiblogger", url: "https://indiblogger.in", da: 59, countries: ["in"], category: "Blog" },
  { name: "ExportersIndia", url: "https://exportersindia.com", da: 60, countries: ["in"], category: "Business" },
  { name: "Quikr India", url: "https://quikr.com", da: 72, countries: ["in"], category: "Directory" },
  { name: "OLX India", url: "https://olx.in", da: 71, countries: ["in"], category: "Directory" },

  // ── Australia ──────────────────────────────────────────────────────
  { name: "TrueLocal", url: "https://truelocal.com.au", da: 70, countries: ["au"], category: "Directory" },
  { name: "StartLocal", url: "https://startlocal.com.au", da: 59, countries: ["au"], category: "Directory" },
  { name: "Hotfrog AU", url: "https://hotfrog.com.au", da: 63, countries: ["au"], category: "Directory" },
  { name: "Yelp AU", url: "https://yelp.com.au", da: 84, countries: ["au"], category: "Directory" },
  { name: "AussieWeb", url: "https://aussieweb.com.au", da: 48, countries: ["au"], category: "Directory" },
  { name: "Localsearch", url: "https://localsearch.com.au", da: 64, countries: ["au"], category: "Directory" },
  { name: "Oneflare", url: "https://oneflare.com.au", da: 62, countries: ["au"], category: "Business" },
  { name: "Hipages", url: "https://hipages.com.au", da: 65, countries: ["au"], category: "Business" },
  { name: "Airtasker", url: "https://airtasker.com", da: 72, countries: ["au"], category: "Business" },

  // ── Canada ─────────────────────────────────────────────────────────
  { name: "YellowPages CA", url: "https://yellowpages.ca", da: 76, countries: ["ca"], category: "Directory" },
  { name: "Canada411", url: "https://canada411.ca", da: 74, countries: ["ca"], category: "Directory" },
  { name: "Yelp CA", url: "https://yelp.ca", da: 88, countries: ["ca"], category: "Directory" },
  { name: "Hotfrog CA", url: "https://hotfrog.ca", da: 60, countries: ["ca"], category: "Directory" },
  { name: "CanadaOne", url: "https://canadaone.com", da: 52, countries: ["ca"], category: "Business" },
  { name: "N49 CA", url: "https://n49.ca", da: 55, countries: ["ca"], category: "Directory" },

  // ── Germany ────────────────────────────────────────────────────────
  { name: "Gelbe Seiten", url: "https://gelbeseiten.de", da: 76, countries: ["de"], category: "Directory" },
  { name: "Das Örtliche", url: "https://dasoertliche.de", da: 71, countries: ["de"], category: "Directory" },
  { name: "11880", url: "https://11880.com", da: 67, countries: ["de"], category: "Directory" },
  { name: "Cylex DE", url: "https://cylex.de", da: 59, countries: ["de"], category: "Directory" },
  { name: "Hotfrog DE", url: "https://hotfrog.de", da: 57, countries: ["de"], category: "Directory" },

  // ── France ─────────────────────────────────────────────────────────
  { name: "PagesJaunes", url: "https://pagesjaunes.fr", da: 77, countries: ["fr"], category: "Directory" },
  { name: "Hotfrog FR", url: "https://hotfrog.fr", da: 55, countries: ["fr"], category: "Directory" },
  { name: "Cylex FR", url: "https://cylex.fr", da: 58, countries: ["fr"], category: "Directory" },

  // ── UAE ────────────────────────────────────────────────────────────
  { name: "Gulf Yellow Pages", url: "https://gulbyellowpages.com", da: 41, countries: ["ae"], category: "Directory" },
  { name: "Dubai Yellow Pages", url: "https://dubaiyellowpagesonline.com", da: 43, countries: ["ae"], category: "Directory" },
  { name: "YellowPages AE", url: "https://yellowpages.ae", da: 52, countries: ["ae"], category: "Directory" },
  { name: "Expat.com UAE", url: "https://expat.com", da: 70, countries: ["ae"], category: "Community" },

  // ── Pakistan ───────────────────────────────────────────────────────
  { name: "Pakbiz", url: "https://pakbiz.com.pk", da: 42, countries: ["pk"], category: "Business" },
  { name: "OLX Pakistan", url: "https://olx.com.pk", da: 64, countries: ["pk"], category: "Directory" },
  { name: "Rozee.pk", url: "https://rozee.pk", da: 58, countries: ["pk"], category: "Business" },
  { name: "Hamariweb", url: "https://hamariweb.com", da: 52, countries: ["pk"], category: "Directory" },

  // ── Philippines ────────────────────────────────────────────────────
  { name: "eYP.ph", url: "https://eyp.ph", da: 41, countries: ["ph"], category: "Directory" },
  { name: "Businesslist PH", url: "https://businesslist.ph", da: 39, countries: ["ph"], category: "Directory" },
  { name: "Sulit.com.ph", url: "https://sulit.com.ph", da: 55, countries: ["ph"], category: "Directory" },

  // ── Nigeria ────────────────────────────────────────────────────────
  { name: "BusinessList NG", url: "https://businesslist.com.ng", da: 43, countries: ["ng"], category: "Directory" },
  { name: "ConnectNigeria", url: "https://connectnigeria.com", da: 46, countries: ["ng"], category: "Directory" },
  { name: "VConnect", url: "https://vconnect.com", da: 44, countries: ["ng"], category: "Directory" },
  { name: "Nairaland", url: "https://nairaland.com", da: 68, countries: ["ng"], category: "Forum" },

  // ── South Africa ───────────────────────────────────────────────────
  { name: "Yellow Pages ZA", url: "https://yellowpages.co.za", da: 57, countries: ["za"], category: "Directory" },
  { name: "Cylex ZA", url: "https://cylex.co.za", da: 51, countries: ["za"], category: "Directory" },
  { name: "Snupit ZA", url: "https://snupit.co.za", da: 43, countries: ["za"], category: "Directory" },
];

const COUNTRIES = [
  { code: "global", name: "Global / International", flag: "🌍" },
  { code: "bd", name: "Bangladesh", flag: "🇧🇩" },
  { code: "us", name: "United States", flag: "🇺🇸" },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { code: "in", name: "India", flag: "🇮🇳" },
  { code: "au", name: "Australia", flag: "🇦🇺" },
  { code: "ca", name: "Canada", flag: "🇨🇦" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "ae", name: "UAE", flag: "🇦🇪" },
  { code: "pk", name: "Pakistan", flag: "🇵🇰" },
  { code: "ph", name: "Philippines", flag: "🇵🇭" },
  { code: "ng", name: "Nigeria", flag: "🇳🇬" },
  { code: "za", name: "South Africa", flag: "🇿🇦" },
];

const CATEGORIES = ["All", "Profile", "Social", "Blog", "Forum", "Directory", "Business", "Dev", "Creative", "Media", "Content", "Education", "Classifieds", "Jobs", "E-Commerce", "Community", "News", "Tech", "Local"];

function daColor(da: number) {
  if (da >= 80) return "text-green-400";
  if (da >= 50) return "text-yellow-400";
  return "text-orange-400";
}

export default function ProfileBacklinkList() {
  const [selectedCountry, setSelectedCountry] = useState<string>("global");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompleted(new Set(JSON.parse(saved)));
    } catch {}
  }, []);

  const saveCompleted = (next: Set<string>) => {
    setCompleted(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
  };

  const toggle = (url: string) => {
    const next = new Set(completed);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    saveCompleted(next);
  };

  const resetAll = () => {
    if (confirm("Reset all checkmarks? This cannot be undone.")) {
      saveCompleted(new Set());
    }
  };

  const filteredSites = useMemo(() => {
    return SITES.filter((s) => {
      // "global" tab = show all international sites only
      // Any country tab = show ONLY that country's local sites
      const matchCountry = s.countries.includes(selectedCountry);
      const matchSearch =
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.url.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || s.category === category;
      const matchHide = hideCompleted ? !completed.has(s.url) : true;
      return matchCountry && matchSearch && matchCategory && matchHide;
    }).sort((a, b) => b.da - a.da);
  }, [selectedCountry, search, category, hideCompleted, completed]);

  const totalInView = filteredSites.length;
  const doneInView = filteredSites.filter((s) => completed.has(s.url)).length;
  const totalOverall = SITES.length;
  const doneOverall = completed.size;

  const selectedLabel = COUNTRIES.find((c) => c.code === selectedCountry)?.name ?? "";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-7 h-7 text-blue-400" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Profile Backlink Tracker
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Select a country to see <strong className="text-gray-300">only local sites</strong> for that country. Use <strong className="text-gray-300">Global / International</strong> for worldwide platforms.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Sites" value={totalOverall} icon="📋" />
          <StatCard label="Done Overall" value={doneOverall} icon="✅" />
          <StatCard label={`${selectedLabel}`} value={totalInView} icon="👁️" />
          <StatCard label="Done Here" value={doneInView} icon="🎯" />
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Overall Progress</span>
            <span>{doneOverall} / {totalOverall} ({totalOverall > 0 ? Math.round((doneOverall / totalOverall) * 100) : 0}%)</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalOverall > 0 ? (doneOverall / totalOverall) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 space-y-4">
          <div>
            <label className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 block">Select Country</label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setSelectedCountry(c.code); setCategory("All"); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCountry === c.code
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search sites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
              <div
                onClick={() => setHideCompleted(!hideCompleted)}
                className={`w-10 h-5 rounded-full transition-colors ${hideCompleted ? "bg-blue-600" : "bg-gray-700"} relative cursor-pointer`}
              >
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hideCompleted ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm text-gray-300">Hide done</span>
            </label>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400 hover:text-red-400 hover:border-red-500 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Site List */}
        {filteredSites.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No sites match your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSites.map((site) => {
              const done = completed.has(site.url);
              return (
                <div
                  key={site.url + site.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    done
                      ? "bg-green-950/30 border-green-800/40"
                      : "bg-gray-900 border-gray-800 hover:border-gray-600"
                  }`}
                >
                  <button
                    onClick={() => toggle(site.url)}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      done
                        ? "bg-green-500 border-green-500"
                        : "border-gray-600 hover:border-green-400"
                    }`}
                  >
                    {done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${done ? "line-through text-gray-500" : "text-gray-100"}`}>
                        {site.name}
                      </span>
                      <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                        {site.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 truncate block">{site.url}</span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${daColor(site.da)}`}>DA {site.da}</div>
                  </div>

                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                    title="Open site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-600 mt-8">
          {SITES.length} sites total · DA = Domain Authority (approximate) · Checkmarks saved in browser localStorage
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
      <div className="text-xl">{icon}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 truncate">{label}</div>
    </div>
  );
}
