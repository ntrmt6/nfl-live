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
  { name: "Brabys ZA", url: "https://brabys.com", da: 48, countries: ["za"], category: "Directory" },
  { name: "Business Index ZA", url: "https://businessindex.co.za", da: 40, countries: ["za"], category: "Directory" },
  { name: "Gumtree ZA", url: "https://gumtree.co.za", da: 68, countries: ["za"], category: "Classifieds" },
  { name: "OLX ZA", url: "https://olx.co.za", da: 66, countries: ["za"], category: "Classifieds" },
  { name: "BizCommunity ZA", url: "https://bizcommunity.com", da: 63, countries: ["za"], category: "Business" },

  // ── More Global – Press Release ────────────────────────────────────
  { name: "PRLog", url: "https://prlog.org", da: 81, countries: ["global"], category: "Press Release" },
  { name: "PR.com", url: "https://pr.com", da: 71, countries: ["global"], category: "Press Release" },
  { name: "OpenPR", url: "https://openpr.com", da: 72, countries: ["global"], category: "Press Release" },
  { name: "24-7 Press Release", url: "https://24-7pressrelease.com", da: 67, countries: ["global"], category: "Press Release" },
  { name: "i-Newswire", url: "https://i-newswire.com", da: 64, countries: ["global"], category: "Press Release" },
  { name: "PR Inside", url: "https://pr-inside.com", da: 63, countries: ["global"], category: "Press Release" },
  { name: "PRFree", url: "https://prfree.org", da: 62, countries: ["global"], category: "Press Release" },
  { name: "Free Press Release", url: "https://freepressrelease.com", da: 58, countries: ["global"], category: "Press Release" },
  { name: "Business Wire", url: "https://businesswire.com", da: 91, countries: ["global"], category: "Press Release" },
  { name: "Newswire", url: "https://newswire.com", da: 78, countries: ["global"], category: "Press Release" },
  { name: "MarketersMEDIA", url: "https://marketersmedia.com", da: 61, countries: ["global"], category: "Press Release" },
  { name: "PRBuzz", url: "https://prbuzz.com", da: 60, countries: ["global"], category: "Press Release" },
  { name: "PRLeap", url: "https://prleap.com", da: 65, countries: ["global"], category: "Press Release" },
  { name: "1888 Press Release", url: "https://1888pressrelease.com", da: 57, countries: ["global"], category: "Press Release" },
  { name: "Press Release Point", url: "https://pressreleasepoint.com", da: 55, countries: ["global"], category: "Press Release" },

  // ── More Global – Video & Streaming ───────────────────────────────
  { name: "Dailymotion", url: "https://dailymotion.com", da: 94, countries: ["global"], category: "Media" },
  { name: "Twitch", url: "https://twitch.tv", da: 96, countries: ["global"], category: "Media" },
  { name: "Rumble", url: "https://rumble.com", da: 80, countries: ["global"], category: "Media" },
  { name: "Odysee", url: "https://odysee.com", da: 76, countries: ["global"], category: "Media" },
  { name: "Bitchute", url: "https://bitchute.com", da: 72, countries: ["global"], category: "Media" },
  { name: "Metacafe", url: "https://metacafe.com", da: 82, countries: ["global"], category: "Media" },
  { name: "Veoh", url: "https://veoh.com", da: 75, countries: ["global"], category: "Media" },
  { name: "Vevo", url: "https://vevo.com", da: 84, countries: ["global"], category: "Media" },
  { name: "TikTok", url: "https://tiktok.com", da: 95, countries: ["global"], category: "Social" },
  { name: "Snapchat", url: "https://snapchat.com", da: 93, countries: ["global"], category: "Social" },

  // ── More Global – Developer & Tech ────────────────────────────────
  { name: "Dev.to", url: "https://dev.to", da: 84, countries: ["global"], category: "Dev" },
  { name: "Hashnode", url: "https://hashnode.com", da: 80, countries: ["global"], category: "Dev" },
  { name: "CodePen", url: "https://codepen.io", da: 91, countries: ["global"], category: "Dev" },
  { name: "HackerNews", url: "https://news.ycombinator.com", da: 91, countries: ["global"], category: "Dev" },
  { name: "Lobste.rs", url: "https://lobste.rs", da: 78, countries: ["global"], category: "Dev" },
  { name: "Slashdot", url: "https://slashdot.org", da: 88, countries: ["global"], category: "Dev" },
  { name: "Hacker Noon", url: "https://hackernoon.com", da: 84, countries: ["global"], category: "Dev" },
  { name: "Bitbucket", url: "https://bitbucket.org", da: 93, countries: ["global"], category: "Dev" },
  { name: "SourceForge", url: "https://sourceforge.net", da: 92, countries: ["global"], category: "Dev" },
  { name: "NPM", url: "https://npmjs.com", da: 93, countries: ["global"], category: "Dev" },
  { name: "PyPI", url: "https://pypi.org", da: 88, countries: ["global"], category: "Dev" },
  { name: "Launchpad", url: "https://launchpad.net", da: 87, countries: ["global"], category: "Dev" },
  { name: "Codesandbox", url: "https://codesandbox.io", da: 82, countries: ["global"], category: "Dev" },
  { name: "Glitch.com", url: "https://glitch.com", da: 79, countries: ["global"], category: "Dev" },
  { name: "StackBlitz", url: "https://stackblitz.com", da: 75, countries: ["global"], category: "Dev" },

  // ── More Global – Profile & Bio Link ──────────────────────────────
  { name: "Linktree", url: "https://linktr.ee", da: 86, countries: ["global"], category: "Profile" },
  { name: "Carrd", url: "https://carrd.co", da: 76, countries: ["global"], category: "Profile" },
  { name: "Bio.link", url: "https://bio.link", da: 72, countries: ["global"], category: "Profile" },
  { name: "Beacons.ai", url: "https://beacons.ai", da: 68, countries: ["global"], category: "Profile" },
  { name: "Solo.to", url: "https://solo.to", da: 67, countries: ["global"], category: "Profile" },
  { name: "Milkshake.app", url: "https://milksha.ke", da: 63, countries: ["global"], category: "Profile" },
  { name: "Campsite.bio", url: "https://campsite.bio", da: 66, countries: ["global"], category: "Profile" },
  { name: "Muckrack", url: "https://muckrack.com", da: 80, countries: ["global"], category: "Profile" },
  { name: "Authorsguild", url: "https://authorsguild.org", da: 73, countries: ["global"], category: "Profile" },
  { name: "Lawyered.in", url: "https://lawyered.in", da: 52, countries: ["global"], category: "Profile" },
  { name: "Myworkdrive", url: "https://myworkdrive.com", da: 58, countries: ["global"], category: "Profile" },

  // ── More Global – Social Bookmarking ──────────────────────────────
  { name: "Mix.com", url: "https://mix.com", da: 82, countries: ["global"], category: "Social" },
  { name: "Digg", url: "https://digg.com", da: 88, countries: ["global"], category: "Social" },
  { name: "BizSugar", url: "https://bizsugar.com", da: 71, countries: ["global"], category: "Business" },
  { name: "Newsvine", url: "https://newsvine.com", da: 79, countries: ["global"], category: "Social" },
  { name: "Fark", url: "https://fark.com", da: 80, countries: ["global"], category: "Social" },
  { name: "Inbound.org", url: "https://inbound.org", da: 73, countries: ["global"], category: "Social" },
  { name: "GrowthHackers", url: "https://growthhackers.com", da: 75, countries: ["global"], category: "Business" },
  { name: "Dribble Profile", url: "https://dribbble.com", da: 91, countries: ["global"], category: "Creative" },
  { name: "Cite HR", url: "https://citehr.com", da: 70, countries: ["global"], category: "Forum" },
  { name: "The Student Room", url: "https://thestudentroom.co.uk", da: 76, countries: ["global"], category: "Forum" },
  { name: "eHow", url: "https://ehow.com", da: 82, countries: ["global"], category: "Content" },

  // ── More Global – Podcast ──────────────────────────────────────────
  { name: "Anchor.fm (Spotify)", url: "https://anchor.fm", da: 89, countries: ["global"], category: "Media" },
  { name: "Podbean", url: "https://podbean.com", da: 79, countries: ["global"], category: "Media" },
  { name: "Buzzsprout", url: "https://buzzsprout.com", da: 77, countries: ["global"], category: "Media" },
  { name: "Spreaker", url: "https://spreaker.com", da: 79, countries: ["global"], category: "Media" },
  { name: "Audioboom", url: "https://audioboom.com", da: 78, countries: ["global"], category: "Media" },
  { name: "Podomatic", url: "https://podomatic.com", da: 73, countries: ["global"], category: "Media" },
  { name: "Podchaser", url: "https://podchaser.com", da: 71, countries: ["global"], category: "Media" },

  // ── More Global – Reviews ──────────────────────────────────────────
  { name: "GetApp", url: "https://getapp.com", da: 82, countries: ["global"], category: "Business" },
  { name: "Software Advice", url: "https://softwareadvice.com", da: 84, countries: ["global"], category: "Business" },
  { name: "Crozdesk", url: "https://crozdesk.com", da: 70, countries: ["global"], category: "Business" },
  { name: "AlternativeTo", url: "https://alternativeto.net", da: 84, countries: ["global"], category: "Business" },
  { name: "SaaSworthy", url: "https://saasworthy.com", da: 68, countries: ["global"], category: "Business" },
  { name: "Gartner Peer Insights", url: "https://gartner.com/peer-insights", da: 91, countries: ["global"], category: "Business" },
  { name: "Sitejabber", url: "https://sitejabber.com", da: 76, countries: ["global"], category: "Business" },
  { name: "TrustRadius", url: "https://trustradius.com", da: 79, countries: ["global"], category: "Business" },
  { name: "Reviews.io", url: "https://reviews.io", da: 71, countries: ["global"], category: "Business" },

  // ── More Global – Knowledge & Learning ────────────────────────────
  { name: "WikiHow", url: "https://wikihow.com", da: 93, countries: ["global"], category: "Education" },
  { name: "Fandom", url: "https://fandom.com", da: 93, countries: ["global"], category: "Education" },
  { name: "edX", url: "https://edx.org", da: 91, countries: ["global"], category: "Education" },
  { name: "Udacity", url: "https://udacity.com", da: 87, countries: ["global"], category: "Education" },
  { name: "Khan Academy", url: "https://khanacademy.org", da: 92, countries: ["global"], category: "Education" },
  { name: "Skillshare", url: "https://skillshare.com", da: 88, countries: ["global"], category: "Education" },
  { name: "Lynda/LinkedIn Learning", url: "https://linkedin.com/learning", da: 98, countries: ["global"], category: "Education" },
  { name: "Teachable", url: "https://teachable.com", da: 83, countries: ["global"], category: "Education" },
  { name: "Thinkific", url: "https://thinkific.com", da: 79, countries: ["global"], category: "Education" },
  { name: "Pluralsight", url: "https://pluralsight.com", da: 88, countries: ["global"], category: "Education" },
  { name: "Brilliant.org", url: "https://brilliant.org", da: 82, countries: ["global"], category: "Education" },

  // ── More Global – Health & Lifestyle ──────────────────────────────
  { name: "Healthgrades", url: "https://healthgrades.com", da: 81, countries: ["global"], category: "Directory" },
  { name: "Zocdoc", url: "https://zocdoc.com", da: 82, countries: ["global"], category: "Directory" },
  { name: "Vitals", url: "https://vitals.com", da: 72, countries: ["global"], category: "Directory" },
  { name: "RateMDs", url: "https://ratemds.com", da: 69, countries: ["global"], category: "Directory" },
  { name: "Psychology Today", url: "https://psychologytoday.com", da: 91, countries: ["global"], category: "Directory" },
  { name: "Doximity", url: "https://doximity.com", da: 78, countries: ["global"], category: "Profile" },
  { name: "Strava", url: "https://strava.com", da: 89, countries: ["global"], category: "Social" },
  { name: "MyFitnessPal", url: "https://myfitnesspal.com", da: 87, countries: ["global"], category: "Profile" },
  { name: "Allrecipes", url: "https://allrecipes.com", da: 92, countries: ["global"], category: "Community" },
  { name: "Food.com", url: "https://food.com", da: 89, countries: ["global"], category: "Community" },

  // ── More Global – Travel ───────────────────────────────────────────
  { name: "Booking.com", url: "https://booking.com", da: 95, countries: ["global"], category: "Directory" },
  { name: "Expedia", url: "https://expedia.com", da: 93, countries: ["global"], category: "Directory" },
  { name: "Hotels.com", url: "https://hotels.com", da: 92, countries: ["global"], category: "Directory" },
  { name: "Airbnb", url: "https://airbnb.com", da: 95, countries: ["global"], category: "Directory" },
  { name: "Lonely Planet", url: "https://lonelyplanet.com", da: 91, countries: ["global"], category: "Community" },
  { name: "Couchsurfing", url: "https://couchsurfing.com", da: 81, countries: ["global"], category: "Community" },
  { name: "Nomadlist", url: "https://nomadlist.com", da: 77, countries: ["global"], category: "Community" },
  { name: "iOverlander", url: "https://ioverlander.com", da: 65, countries: ["global"], category: "Community" },

  // ── More Global – Finance ──────────────────────────────────────────
  { name: "Investopedia", url: "https://investopedia.com", da: 93, countries: ["global"], category: "Directory" },
  { name: "SeekingAlpha", url: "https://seekingalpha.com", da: 88, countries: ["global"], category: "Community" },
  { name: "StockTwits", url: "https://stocktwits.com", da: 79, countries: ["global"], category: "Social" },
  { name: "Motley Fool", url: "https://fool.com", da: 88, countries: ["global"], category: "Community" },
  { name: "Mint Community", url: "https://mint.intuit.com", da: 91, countries: ["global"], category: "Directory" },

  // ── More Global – Niche ───────────────────────────────────────────
  { name: "Ravelry", url: "https://ravelry.com", da: 84, countries: ["global"], category: "Creative" },
  { name: "Untappd", url: "https://untappd.com", da: 79, countries: ["global"], category: "Social" },
  { name: "Goodreads Author", url: "https://goodreads.com/author", da: 93, countries: ["global"], category: "Profile" },
  { name: "LibraryThing", url: "https://librarything.com", da: 82, countries: ["global"], category: "Community" },
  { name: "Letterboxd", url: "https://letterboxd.com", da: 83, countries: ["global"], category: "Social" },
  { name: "Trakt.tv", url: "https://trakt.tv", da: 78, countries: ["global"], category: "Social" },
  { name: "IMDb", url: "https://imdb.com", da: 96, countries: ["global"], category: "Directory" },
  { name: "Rotten Tomatoes", url: "https://rottentomatoes.com", da: 92, countries: ["global"], category: "Directory" },
  { name: "TV.com", url: "https://tv.com", da: 81, countries: ["global"], category: "Directory" },
  { name: "Metacritic", url: "https://metacritic.com", da: 90, countries: ["global"], category: "Directory" },
  { name: "MobyGames", url: "https://mobygames.com", da: 80, countries: ["global"], category: "Directory" },
  { name: "BoardGameGeek", url: "https://boardgamegeek.com", da: 85, countries: ["global"], category: "Community" },
  { name: "Chess.com", url: "https://chess.com", da: 88, countries: ["global"], category: "Community" },
  { name: "Lichess", url: "https://lichess.org", da: 83, countries: ["global"], category: "Community" },
  { name: "Sports Reference", url: "https://sports-reference.com", da: 86, countries: ["global"], category: "Directory" },
  { name: "ESPN Profile", url: "https://espn.com", da: 94, countries: ["global"], category: "Directory" },
  { name: "Sportskeeda", url: "https://sportskeeda.com", da: 84, countries: ["global"], category: "Community" },
  { name: "FanSided", url: "https://fansided.com", da: 83, countries: ["global"], category: "Community" },
  { name: "Bleacher Report", url: "https://bleacherreport.com", da: 87, countries: ["global"], category: "Community" },

  // ── More Global – Writing & Publishing ────────────────────────────
  { name: "Inkitt", url: "https://inkitt.com", da: 72, countries: ["global"], category: "Blog" },
  { name: "Royal Road", url: "https://royalroad.com", da: 77, countries: ["global"], category: "Blog" },
  { name: "FictionPress", url: "https://fictionpress.com", da: 74, countries: ["global"], category: "Blog" },
  { name: "Archive of Our Own", url: "https://archiveofourown.org", da: 90, countries: ["global"], category: "Blog" },
  { name: "Vocal Media", url: "https://vocal.media", da: 72, countries: ["global"], category: "Blog" },
  { name: "Substack", url: "https://substack.com", da: 88, countries: ["global"], category: "Blog" },
  { name: "Ghost.io", url: "https://ghost.org", da: 87, countries: ["global"], category: "Blog" },
  { name: "Patreon", url: "https://patreon.com", da: 90, countries: ["global"], category: "Profile" },
  { name: "Ko-fi", url: "https://ko-fi.com", da: 79, countries: ["global"], category: "Profile" },
  { name: "Buy Me A Coffee", url: "https://buymeacoffee.com", da: 77, countries: ["global"], category: "Profile" },

  // ── More Global – AI/Tech Communities ─────────────────────────────
  { name: "Hugging Face", url: "https://huggingface.co", da: 82, countries: ["global"], category: "Dev" },
  { name: "Kaggle Notebooks", url: "https://kaggle.com", da: 87, countries: ["global"], category: "Dev" },
  { name: "PaperWithCode", url: "https://paperswithcode.com", da: 76, countries: ["global"], category: "Dev" },
  { name: "Towards Data Science", url: "https://towardsdatascience.com", da: 86, countries: ["global"], category: "Dev" },

  // ── More USA ───────────────────────────────────────────────────────
  { name: "Alignable", url: "https://alignable.com", da: 72, countries: ["us"], category: "Business" },
  { name: "Chamber of Commerce", url: "https://chamberofcommerce.com", da: 79, countries: ["us"], category: "Business" },
  { name: "Better Business Bureau", url: "https://bbb.org", da: 91, countries: ["us"], category: "Business" },
  { name: "Bing Places US", url: "https://bingplaces.com", da: 89, countries: ["us"], category: "Directory" },
  { name: "Apple Maps Connect", url: "https://mapsconnect.apple.com", da: 96, countries: ["us"], category: "Directory" },
  { name: "Nextdoor", url: "https://nextdoor.com", da: 83, countries: ["us"], category: "Social" },
  { name: "Patch.com", url: "https://patch.com", da: 79, countries: ["us"], category: "Community" },
  { name: "Angie's List", url: "https://angi.com", da: 88, countries: ["us"], category: "Directory" },
  { name: "ServiceMagic", url: "https://servicemagic.com", da: 77, countries: ["us"], category: "Directory" },
  { name: "Houzz US", url: "https://houzz.com", da: 91, countries: ["us"], category: "Directory" },
  { name: "Networkedblogs US", url: "https://networkedblogs.com", da: 75, countries: ["us"], category: "Blog" },
  { name: "Spoke.com", url: "https://spoke.com", da: 71, countries: ["us"], category: "Business" },
  { name: "Dandb Credibility", url: "https://dnb.com", da: 87, countries: ["us"], category: "Business" },
  { name: "Data.com", url: "https://data.com", da: 79, countries: ["us"], category: "Business" },
  { name: "AboutUs.org", url: "https://aboutus.com", da: 69, countries: ["us"], category: "Directory" },
  { name: "Botw.org", url: "https://botw.org", da: 74, countries: ["us"], category: "Directory" },
  { name: "Best of Web", url: "https://bestoftheweb.com", da: 73, countries: ["us"], category: "Directory" },
  { name: "Elocal", url: "https://elocal.com", da: 68, countries: ["us"], category: "Directory" },
  { name: "Switchboard", url: "https://switchboard.com", da: 67, countries: ["us"], category: "Directory" },
  { name: "FourSquare US", url: "https://foursquare.com", da: 93, countries: ["us"], category: "Directory" },
  { name: "City Squares", url: "https://citysquares.com", da: 61, countries: ["us"], category: "Directory" },
  { name: "US City", url: "https://uscity.net", da: 59, countries: ["us"], category: "Directory" },
  { name: "My Huckleberry", url: "https://myhuckleberry.com", da: 56, countries: ["us"], category: "Directory" },
  { name: "Blogarama US", url: "https://blogarama.com", da: 64, countries: ["us"], category: "Blog" },
  { name: "Jasmine Directory", url: "https://jasminedirectory.com", da: 52, countries: ["us"], category: "Directory" },

  // ── More UK ────────────────────────────────────────────────────────
  { name: "Approved Business UK", url: "https://approvedbusiness.co.uk", da: 57, countries: ["uk"], category: "Directory" },
  { name: "Ufindus UK", url: "https://ufindus.com", da: 51, countries: ["uk"], category: "Directory" },
  { name: "B2Bindex UK", url: "https://b2bindex.co.uk", da: 46, countries: ["uk"], category: "Business" },
  { name: "Touch Local UK", url: "https://touchlocal.co.uk", da: 58, countries: ["uk"], category: "Directory" },
  { name: "Gumtree UK", url: "https://gumtree.com", da: 82, countries: ["uk"], category: "Classifieds" },
  { name: "Rightmove UK", url: "https://rightmove.co.uk", da: 87, countries: ["uk"], category: "Directory" },
  { name: "Zoopla UK", url: "https://zoopla.co.uk", da: 85, countries: ["uk"], category: "Directory" },
  { name: "UK Smallbusiness", url: "https://uksmallbusinessdirectory.co.uk", da: 43, countries: ["uk"], category: "Directory" },
  { name: "The Gazette UK", url: "https://thegazette.co.uk", da: 77, countries: ["uk"], category: "Directory" },
  { name: "Cylex UK", url: "https://cylex.co.uk", da: 55, countries: ["uk"], category: "Directory" },
  { name: "Brownbook UK", url: "https://brownbook.net", da: 63, countries: ["uk"], category: "Directory" },
  { name: "Local Life UK", url: "https://locallife.co.uk", da: 52, countries: ["uk"], category: "Directory" },

  // ── More India ─────────────────────────────────────────────────────
  { name: "AskLaila", url: "https://asklaila.com", da: 58, countries: ["in"], category: "Directory" },
  { name: "Getit", url: "https://getit.in", da: 56, countries: ["in"], category: "Directory" },
  { name: "Grotal", url: "https://grotal.com", da: 54, countries: ["in"], category: "Directory" },
  { name: "Indialist", url: "https://indialist.com", da: 47, countries: ["in"], category: "Directory" },
  { name: "UrbanClap (Urban Company)", url: "https://urbancompany.com", da: 63, countries: ["in"], category: "Business" },
  { name: "IndiaBizClub", url: "https://indiabizclub.com", da: 44, countries: ["in"], category: "Business" },
  { name: "Naukri", url: "https://naukri.com", da: 77, countries: ["in"], category: "Jobs" },
  { name: "Shine.com", url: "https://shine.com", da: 68, countries: ["in"], category: "Jobs" },
  { name: "Monster India", url: "https://monsterindia.com", da: 70, countries: ["in"], category: "Jobs" },
  { name: "Flipkart", url: "https://flipkart.com", da: 78, countries: ["in"], category: "E-Commerce" },
  { name: "Snapdeal", url: "https://snapdeal.com", da: 72, countries: ["in"], category: "E-Commerce" },
  { name: "Paytm", url: "https://paytm.com", da: 78, countries: ["in"], category: "E-Commerce" },
  { name: "MagicBricks", url: "https://magicbricks.com", da: 73, countries: ["in"], category: "Directory" },
  { name: "99acres", url: "https://99acres.com", da: 72, countries: ["in"], category: "Directory" },
  { name: "Housing.com", url: "https://housing.com", da: 66, countries: ["in"], category: "Directory" },
  { name: "Practo", url: "https://practo.com", da: 68, countries: ["in"], category: "Directory" },
  { name: "Lybrate", url: "https://lybrate.com", da: 61, countries: ["in"], category: "Directory" },
  { name: "Mydala", url: "https://mydala.com", da: 57, countries: ["in"], category: "Business" },
  { name: "Bharat Pages", url: "https://bharatpages.com", da: 48, countries: ["in"], category: "Directory" },
  { name: "AcBiz", url: "https://acbiz.in", da: 38, countries: ["in"], category: "Directory" },

  // ── More Australia ─────────────────────────────────────────────────
  { name: "SEEK AU", url: "https://seek.com.au", da: 84, countries: ["au"], category: "Jobs" },
  { name: "Domain AU", url: "https://domain.com.au", da: 82, countries: ["au"], category: "Directory" },
  { name: "RealEstate AU", url: "https://realestate.com.au", da: 84, countries: ["au"], category: "Directory" },
  { name: "Gumtree AU", url: "https://gumtree.com.au", da: 79, countries: ["au"], category: "Classifieds" },
  { name: "Tradies AU", url: "https://tradies.com.au", da: 52, countries: ["au"], category: "Directory" },
  { name: "PurplePages AU", url: "https://purplepages.com.au", da: 48, countries: ["au"], category: "Directory" },
  { name: "Infobel AU", url: "https://infobel.com/au", da: 56, countries: ["au"], category: "Directory" },
  { name: "Goguide AU", url: "https://goguide.com.au", da: 44, countries: ["au"], category: "Directory" },

  // ── More Canada ────────────────────────────────────────────────────
  { name: "Kijiji CA", url: "https://kijiji.ca", da: 80, countries: ["ca"], category: "Classifieds" },
  { name: "Indeed CA", url: "https://ca.indeed.com", da: 93, countries: ["ca"], category: "Jobs" },
  { name: "Workopolis", url: "https://workopolis.com", da: 71, countries: ["ca"], category: "Jobs" },
  { name: "Monster CA", url: "https://monster.ca", da: 79, countries: ["ca"], category: "Jobs" },
  { name: "ReMax CA", url: "https://remax.ca", da: 77, countries: ["ca"], category: "Directory" },
  { name: "Realtor CA", url: "https://realtor.ca", da: 79, countries: ["ca"], category: "Directory" },
  { name: "Homestars CA", url: "https://homestars.com", da: 69, countries: ["ca"], category: "Directory" },
  { name: "Porch CA", url: "https://porch.com", da: 72, countries: ["ca"], category: "Directory" },
  { name: "BusinessDirectory CA", url: "https://businessdirectory.com", da: 57, countries: ["ca"], category: "Directory" },
  { name: "Canpages CA", url: "https://canpages.com", da: 60, countries: ["ca"], category: "Directory" },
  { name: "TorPortal CA", url: "https://torportal.com", da: 44, countries: ["ca"], category: "Directory" },
  { name: "Tupalo CA", url: "https://tupalo.com", da: 51, countries: ["ca"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── BRAZIL ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Brazil", url: "https://olx.com.br", da: 74, countries: ["br"], category: "Classifieds" },
  { name: "Mercado Livre BR", url: "https://mercadolivre.com.br", da: 79, countries: ["br"], category: "E-Commerce" },
  { name: "Empregos BR", url: "https://empregos.com.br", da: 65, countries: ["br"], category: "Jobs" },
  { name: "Catho", url: "https://catho.com.br", da: 72, countries: ["br"], category: "Jobs" },
  { name: "InfoEmprego", url: "https://infojobs.com.br", da: 68, countries: ["br"], category: "Jobs" },
  { name: "Vivareal BR", url: "https://vivareal.com.br", da: 71, countries: ["br"], category: "Directory" },
  { name: "Zap Imóveis", url: "https://zapimoveis.com.br", da: 73, countries: ["br"], category: "Directory" },
  { name: "Imovelweb BR", url: "https://imovelweb.com.br", da: 66, countries: ["br"], category: "Directory" },
  { name: "Apontador BR", url: "https://apontador.com.br", da: 68, countries: ["br"], category: "Directory" },
  { name: "Yelp Brazil", url: "https://yelp.com.br", da: 88, countries: ["br"], category: "Directory" },
  { name: "GuiaMais BR", url: "https://guiamais.com.br", da: 62, countries: ["br"], category: "Directory" },
  { name: "ListenBR", url: "https://listenbr.com", da: 48, countries: ["br"], category: "Directory" },
  { name: "GreenList BR", url: "https://greenlist.com.br", da: 42, countries: ["br"], category: "Directory" },
  { name: "Blogspot BR", url: "https://blogspot.com.br", da: 94, countries: ["br"], category: "Blog" },
  { name: "Blogger BR", url: "https://blogger.com", da: 94, countries: ["br"], category: "Blog" },
  { name: "Medium Brazil", url: "https://medium.com/brasil", da: 95, countries: ["br"], category: "Blog" },
  { name: "Tecnoblog", url: "https://tecnoblog.net", da: 68, countries: ["br"], category: "Blog" },
  { name: "TechTudo BR", url: "https://techtudo.com.br", da: 73, countries: ["br"], category: "Blog" },
  { name: "iMasters BR", url: "https://imasters.com.br", da: 69, countries: ["br"], category: "Dev" },
  { name: "Tableless BR", url: "https://tableless.com.br", da: 60, countries: ["br"], category: "Dev" },
  { name: "Fórum DevMedia BR", url: "https://devmedia.com.br", da: 64, countries: ["br"], category: "Dev" },
  { name: "Taboola BR", url: "https://taboola.com", da: 88, countries: ["br"], category: "Media" },
  { name: "Flippa BR", url: "https://flippa.com", da: 79, countries: ["br"], category: "Business" },
  { name: "StartupBase BR", url: "https://startupbase.com.br", da: 47, countries: ["br"], category: "Business" },
  { name: "Hotmart", url: "https://hotmart.com", da: 76, countries: ["br"], category: "Business" },
  { name: "Eduzz BR", url: "https://eduzz.com", da: 66, countries: ["br"], category: "Business" },

  // ════════════════════════════════════════════════════════════════════
  // ── MEXICO ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Mexico", url: "https://olx.com.mx", da: 68, countries: ["mx"], category: "Classifieds" },
  { name: "Segundamano MX", url: "https://segundamano.mx", da: 66, countries: ["mx"], category: "Classifieds" },
  { name: "Mercado Libre MX", url: "https://mercadolibre.com.mx", da: 78, countries: ["mx"], category: "E-Commerce" },
  { name: "Vivanuncios MX", url: "https://vivanuncios.com.mx", da: 63, countries: ["mx"], category: "Classifieds" },
  { name: "CompuTrabajo MX", url: "https://computrabajo.com.mx", da: 67, countries: ["mx"], category: "Jobs" },
  { name: "OCCMundial", url: "https://occ.com.mx", da: 72, countries: ["mx"], category: "Jobs" },
  { name: "Indeed MX", url: "https://mx.indeed.com", da: 93, countries: ["mx"], category: "Jobs" },
  { name: "Inmuebles24 MX", url: "https://inmuebles24.com", da: 65, countries: ["mx"], category: "Directory" },
  { name: "Metros Cúbicos MX", url: "https://metroscubicos.com", da: 69, countries: ["mx"], category: "Directory" },
  { name: "México Pages", url: "https://paginasamarillas.com.mx", da: 60, countries: ["mx"], category: "Directory" },
  { name: "Sección Amarilla MX", url: "https://seccionamarilla.com.mx", da: 66, countries: ["mx"], category: "Directory" },
  { name: "Hotfrog MX", url: "https://hotfrog.com.mx", da: 56, countries: ["mx"], category: "Directory" },
  { name: "Cylex MX", url: "https://cylex.com.mx", da: 49, countries: ["mx"], category: "Directory" },
  { name: "Telmex Directorio MX", url: "https://directoriocfi.com.mx", da: 43, countries: ["mx"], category: "Directory" },
  { name: "Startup México", url: "https://startupmexico.com", da: 48, countries: ["mx"], category: "Business" },

  // ════════════════════════════════════════════════════════════════════
  // ── INDONESIA ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Indonesia", url: "https://olx.co.id", da: 66, countries: ["id"], category: "Classifieds" },
  { name: "Tokopedia", url: "https://tokopedia.com", da: 77, countries: ["id"], category: "E-Commerce" },
  { name: "Bukalapak", url: "https://bukalapak.com", da: 74, countries: ["id"], category: "E-Commerce" },
  { name: "Shopee ID", url: "https://shopee.co.id", da: 73, countries: ["id"], category: "E-Commerce" },
  { name: "Kaskus", url: "https://kaskus.co.id", da: 72, countries: ["id"], category: "Forum" },
  { name: "Urbanindo ID", url: "https://urbanindo.com", da: 60, countries: ["id"], category: "Directory" },
  { name: "Lamudi ID", url: "https://lamudi.co.id", da: 58, countries: ["id"], category: "Directory" },
  { name: "Rumah.com ID", url: "https://rumah.com", da: 63, countries: ["id"], category: "Directory" },
  { name: "Loker ID", url: "https://loker.id", da: 50, countries: ["id"], category: "Jobs" },
  { name: "Jobstreet ID", url: "https://jobstreet.co.id", da: 68, countries: ["id"], category: "Jobs" },
  { name: "Glints ID", url: "https://glints.com", da: 64, countries: ["id"], category: "Jobs" },
  { name: "Detik.com", url: "https://detik.com", da: 77, countries: ["id"], category: "News" },
  { name: "Kompas ID", url: "https://kompas.com", da: 78, countries: ["id"], category: "News" },
  { name: "Tribun News ID", url: "https://tribunnews.com", da: 73, countries: ["id"], category: "News" },
  { name: "Idntimes ID", url: "https://idntimes.com", da: 65, countries: ["id"], category: "Community" },
  { name: "Indopos ID", url: "https://indopos.co.id", da: 50, countries: ["id"], category: "News" },
  { name: "Cylex ID", url: "https://cylex.co.id", da: 46, countries: ["id"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── MALAYSIA ──────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Mudah MY", url: "https://mudah.my", da: 68, countries: ["my"], category: "Classifieds" },
  { name: "Lelong MY", url: "https://lelong.com.my", da: 64, countries: ["my"], category: "E-Commerce" },
  { name: "Lazada MY", url: "https://lazada.com.my", da: 72, countries: ["my"], category: "E-Commerce" },
  { name: "Shopee MY", url: "https://shopee.com.my", da: 72, countries: ["my"], category: "E-Commerce" },
  { name: "Jobstreet MY", url: "https://jobstreet.com.my", da: 72, countries: ["my"], category: "Jobs" },
  { name: "iProperty MY", url: "https://iproperty.com.my", da: 64, countries: ["my"], category: "Directory" },
  { name: "Edgeprop MY", url: "https://edgeprop.my", da: 57, countries: ["my"], category: "Directory" },
  { name: "Cylex MY", url: "https://cylex.com.my", da: 47, countries: ["my"], category: "Directory" },
  { name: "YellowPages MY", url: "https://yellowpages.my", da: 52, countries: ["my"], category: "Directory" },
  { name: "The Star MY", url: "https://thestar.com.my", da: 79, countries: ["my"], category: "News" },
  { name: "Malaymail MY", url: "https://malaymail.com", da: 66, countries: ["my"], category: "News" },
  { name: "Cari Forum MY", url: "https://forum.cari.com.my", da: 63, countries: ["my"], category: "Forum" },
  { name: "Lowyat Forum MY", url: "https://forum.lowyat.net", da: 65, countries: ["my"], category: "Forum" },

  // ════════════════════════════════════════════════════════════════════
  // ── SINGAPORE ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Carousell SG", url: "https://carousell.sg", da: 70, countries: ["sg"], category: "Classifieds" },
  { name: "Gumtree SG", url: "https://gumtree.com.sg", da: 73, countries: ["sg"], category: "Classifieds" },
  { name: "PropertyGuru SG", url: "https://propertyguru.com.sg", da: 74, countries: ["sg"], category: "Directory" },
  { name: "99.co SG", url: "https://99.co", da: 65, countries: ["sg"], category: "Directory" },
  { name: "JobsDB SG", url: "https://jobsdb.com/sg", da: 71, countries: ["sg"], category: "Jobs" },
  { name: "MyCareersFuture SG", url: "https://mycareersfuture.gov.sg", da: 71, countries: ["sg"], category: "Jobs" },
  { name: "Singapore Business", url: "https://singaporebusiness.sg", da: 52, countries: ["sg"], category: "Business" },
  { name: "Yellowpages SG", url: "https://yellowpages.com.sg", da: 56, countries: ["sg"], category: "Directory" },
  { name: "STClassifieds SG", url: "https://stclassifieds.sg", da: 68, countries: ["sg"], category: "Classifieds" },
  { name: "Hardwarezone SG", url: "https://hardwarezone.com.sg", da: 68, countries: ["sg"], category: "Forum" },
  { name: "Expat Forum SG", url: "https://expatforum.com/expats/singapore", da: 55, countries: ["sg"], category: "Community" },

  // ════════════════════════════════════════════════════════════════════
  // ── THAILAND ──────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Kaidee TH", url: "https://kaidee.com", da: 62, countries: ["th"], category: "Classifieds" },
  { name: "Baania TH", url: "https://baania.com", da: 54, countries: ["th"], category: "Directory" },
  { name: "DDproperty TH", url: "https://ddproperty.com", da: 58, countries: ["th"], category: "Directory" },
  { name: "Lazada TH", url: "https://lazada.co.th", da: 70, countries: ["th"], category: "E-Commerce" },
  { name: "Shopee TH", url: "https://shopee.co.th", da: 71, countries: ["th"], category: "E-Commerce" },
  { name: "JobThai", url: "https://jobthai.com", da: 59, countries: ["th"], category: "Jobs" },
  { name: "JobsDB TH", url: "https://th.jobsdb.com", da: 71, countries: ["th"], category: "Jobs" },
  { name: "Pantip TH", url: "https://pantip.com", da: 74, countries: ["th"], category: "Forum" },
  { name: "Thaivisa", url: "https://thaivisa.com", da: 67, countries: ["th"], category: "Community" },
  { name: "Thai Classifieds", url: "https://thai.thaiclassifieds.com", da: 44, countries: ["th"], category: "Classifieds" },
  { name: "Yellowpages TH", url: "https://yellowpages.co.th", da: 48, countries: ["th"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── VIETNAM ───────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Rao Vat VN", url: "https://raovat.net", da: 56, countries: ["vn"], category: "Classifieds" },
  { name: "Cho Tot VN", url: "https://chotot.com", da: 65, countries: ["vn"], category: "Classifieds" },
  { name: "Lazada VN", url: "https://lazada.vn", da: 69, countries: ["vn"], category: "E-Commerce" },
  { name: "Shopee VN", url: "https://shopee.vn", da: 70, countries: ["vn"], category: "E-Commerce" },
  { name: "Tiki VN", url: "https://tiki.vn", da: 68, countries: ["vn"], category: "E-Commerce" },
  { name: "Vatgia VN", url: "https://vatgia.com", da: 59, countries: ["vn"], category: "E-Commerce" },
  { name: "Timviec365 VN", url: "https://timviec365.vn", da: 50, countries: ["vn"], category: "Jobs" },
  { name: "Vietnamworks VN", url: "https://vietnamworks.com", da: 62, countries: ["vn"], category: "Jobs" },
  { name: "Topcv VN", url: "https://topcv.vn", da: 54, countries: ["vn"], category: "Jobs" },
  { name: "BatDongSan VN", url: "https://batdongsan.com.vn", da: 65, countries: ["vn"], category: "Directory" },
  { name: "Nhatot VN", url: "https://nha.chotot.com", da: 65, countries: ["vn"], category: "Directory" },
  { name: "VnExpress VN", url: "https://vnexpress.net", da: 79, countries: ["vn"], category: "News" },
  { name: "Zing.vn", url: "https://zing.vn", da: 74, countries: ["vn"], category: "Community" },

  // ════════════════════════════════════════════════════════════════════
  // ── TURKEY ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Sahibinden TR", url: "https://sahibinden.com", da: 73, countries: ["tr"], category: "Classifieds" },
  { name: "Hürriyet Emlak TR", url: "https://hurriyetemlak.com", da: 68, countries: ["tr"], category: "Directory" },
  { name: "Zingat TR", url: "https://zingat.com", da: 63, countries: ["tr"], category: "Directory" },
  { name: "Kariyer.net TR", url: "https://kariyer.net", da: 69, countries: ["tr"], category: "Jobs" },
  { name: "Indeed TR", url: "https://tr.indeed.com", da: 93, countries: ["tr"], category: "Jobs" },
  { name: "Letgo TR", url: "https://letgo.com", da: 70, countries: ["tr"], category: "Classifieds" },
  { name: "Yemeksepeti TR", url: "https://yemeksepeti.com", da: 68, countries: ["tr"], category: "E-Commerce" },
  { name: "Hepsiburada TR", url: "https://hepsiburada.com", da: 72, countries: ["tr"], category: "E-Commerce" },
  { name: "n11 TR", url: "https://n11.com", da: 71, countries: ["tr"], category: "E-Commerce" },
  { name: "Gittigidiyor TR", url: "https://gittigidiyor.com", da: 70, countries: ["tr"], category: "E-Commerce" },
  { name: "Cylex TR", url: "https://cylex.com.tr", da: 47, countries: ["tr"], category: "Directory" },
  { name: "Hotfrog TR", url: "https://hotfrog.com.tr", da: 53, countries: ["tr"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── EGYPT ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Egypt", url: "https://olx.com.eg", da: 63, countries: ["eg"], category: "Classifieds" },
  { name: "Opensooq EG", url: "https://eg.opensooq.com", da: 65, countries: ["eg"], category: "Classifieds" },
  { name: "Aqarmap EG", url: "https://aqarmap.com.eg", da: 56, countries: ["eg"], category: "Directory" },
  { name: "Wuzzuf EG", url: "https://wuzzuf.net", da: 60, countries: ["eg"], category: "Jobs" },
  { name: "Forasna EG", url: "https://forasna.com", da: 54, countries: ["eg"], category: "Jobs" },
  { name: "Egypt Business Dir", url: "https://egypt-business.com", da: 43, countries: ["eg"], category: "Directory" },
  { name: "Cylex EG", url: "https://cylex.com.eg", da: 46, countries: ["eg"], category: "Directory" },
  { name: "Yellow Pages EG", url: "https://yellowpages.com.eg", da: 50, countries: ["eg"], category: "Directory" },
  { name: "Masrawy EG", url: "https://masrawy.com", da: 72, countries: ["eg"], category: "News" },
  { name: "Youm7 EG", url: "https://youm7.com", da: 73, countries: ["eg"], category: "News" },

  // ════════════════════════════════════════════════════════════════════
  // ── KENYA ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Jiji Kenya", url: "https://jiji.co.ke", da: 62, countries: ["ke"], category: "Classifieds" },
  { name: "PigiaMe KE", url: "https://pigiame.co.ke", da: 56, countries: ["ke"], category: "Classifieds" },
  { name: "Myjobmag KE", url: "https://myjobmag.co.ke", da: 52, countries: ["ke"], category: "Jobs" },
  { name: "BrighterMonday KE", url: "https://brightermonday.co.ke", da: 54, countries: ["ke"], category: "Jobs" },
  { name: "Nation Kenya", url: "https://nation.africa", da: 70, countries: ["ke"], category: "News" },
  { name: "Standard Media KE", url: "https://standardmedia.co.ke", da: 67, countries: ["ke"], category: "News" },
  { name: "Kenya Business Dir", url: "https://kenyabusinessdirectory.co.ke", da: 40, countries: ["ke"], category: "Directory" },
  { name: "VConnect KE", url: "https://ke.vconnect.com", da: 42, countries: ["ke"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── SPAIN ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Wallapop ES", url: "https://wallapop.com", da: 71, countries: ["es"], category: "Classifieds" },
  { name: "Milanuncios ES", url: "https://milanuncios.com", da: 74, countries: ["es"], category: "Classifieds" },
  { name: "Idealista ES", url: "https://idealista.com", da: 80, countries: ["es"], category: "Directory" },
  { name: "Fotocasa ES", url: "https://fotocasa.es", da: 74, countries: ["es"], category: "Directory" },
  { name: "Infojobs ES", url: "https://infojobs.net", da: 75, countries: ["es"], category: "Jobs" },
  { name: "InfoEmpleo ES", url: "https://infoempleo.com", da: 68, countries: ["es"], category: "Jobs" },
  { name: "Páginas Amarillas ES", url: "https://paginasamarillas.es", da: 73, countries: ["es"], category: "Directory" },
  { name: "QDQ.com ES", url: "https://qdq.com", da: 66, countries: ["es"], category: "Directory" },
  { name: "Hotfrog ES", url: "https://hotfrog.es", da: 55, countries: ["es"], category: "Directory" },
  { name: "Cylex ES", url: "https://cylex.es", da: 50, countries: ["es"], category: "Directory" },
  { name: "Emagister ES", url: "https://emagister.com", da: 68, countries: ["es"], category: "Education" },
  { name: "El País ES", url: "https://elpais.com", da: 87, countries: ["es"], category: "News" },
  { name: "El Mundo ES", url: "https://elmundo.es", da: 84, countries: ["es"], category: "News" },

  // ════════════════════════════════════════════════════════════════════
  // ── ITALY ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Subito.it IT", url: "https://subito.it", da: 78, countries: ["it"], category: "Classifieds" },
  { name: "Bakeca IT", url: "https://bakeca.it", da: 71, countries: ["it"], category: "Classifieds" },
  { name: "Idealista IT", url: "https://idealista.it", da: 75, countries: ["it"], category: "Directory" },
  { name: "Immobiliare IT", url: "https://immobiliare.it", da: 77, countries: ["it"], category: "Directory" },
  { name: "InfoJobs IT", url: "https://it.infojobs.net", da: 75, countries: ["it"], category: "Jobs" },
  { name: "Pagine Gialle IT", url: "https://paginegialle.it", da: 74, countries: ["it"], category: "Directory" },
  { name: "TuttoCittà IT", url: "https://tuttocitta.it", da: 71, countries: ["it"], category: "Directory" },
  { name: "Cylex IT", url: "https://cylex.it", da: 51, countries: ["it"], category: "Directory" },
  { name: "Hotfrog IT", url: "https://hotfrog.it", da: 55, countries: ["it"], category: "Directory" },
  { name: "Kompass IT", url: "https://it.kompass.com", da: 65, countries: ["it"], category: "Business" },
  { name: "La Repubblica IT", url: "https://repubblica.it", da: 88, countries: ["it"], category: "News" },
  { name: "Corriere IT", url: "https://corriere.it", da: 87, countries: ["it"], category: "News" },

  // ════════════════════════════════════════════════════════════════════
  // ── JAPAN ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Rakuten JP", url: "https://rakuten.co.jp", da: 89, countries: ["jp"], category: "E-Commerce" },
  { name: "Yahoo Auctions JP", url: "https://auctions.yahoo.co.jp", da: 89, countries: ["jp"], category: "E-Commerce" },
  { name: "Mercari JP", url: "https://mercari.com/jp", da: 82, countries: ["jp"], category: "E-Commerce" },
  { name: "Mynavi JP", url: "https://mynavi.jp", da: 79, countries: ["jp"], category: "Jobs" },
  { name: "Rikunabi JP", url: "https://rikunabi.com", da: 77, countries: ["jp"], category: "Jobs" },
  { name: "En Japan JP", url: "https://en-japan.com", da: 74, countries: ["jp"], category: "Jobs" },
  { name: "SUUMO JP", url: "https://suumo.jp", da: 80, countries: ["jp"], category: "Directory" },
  { name: "At Home JP", url: "https://athome.co.jp", da: 78, countries: ["jp"], category: "Directory" },
  { name: "Hatena Blog JP", url: "https://hatenablog.com", da: 90, countries: ["jp"], category: "Blog" },
  { name: "Ameba JP", url: "https://ameba.jp", da: 89, countries: ["jp"], category: "Blog" },
  { name: "Nicovideo JP", url: "https://nicovideo.jp", da: 84, countries: ["jp"], category: "Media" },
  { name: "Pixiv JP", url: "https://pixiv.net", da: 87, countries: ["jp"], category: "Creative" },
  { name: "Naver JP", url: "https://naver.jp", da: 78, countries: ["jp"], category: "Directory" },
  { name: "Tabelog JP", url: "https://tabelog.com", da: 78, countries: ["jp"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── SOUTH KOREA ───────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Naver Blog KR", url: "https://blog.naver.com", da: 92, countries: ["kr"], category: "Blog" },
  { name: "Daum Cafe KR", url: "https://cafe.daum.net", da: 88, countries: ["kr"], category: "Community" },
  { name: "Tistory KR", url: "https://tistory.com", da: 84, countries: ["kr"], category: "Blog" },
  { name: "Coupang KR", url: "https://coupang.com", da: 78, countries: ["kr"], category: "E-Commerce" },
  { name: "Gmarket KR", url: "https://gmarket.co.kr", da: 77, countries: ["kr"], category: "E-Commerce" },
  { name: "Saramin KR", url: "https://saramin.co.kr", da: 72, countries: ["kr"], category: "Jobs" },
  { name: "JobKorea KR", url: "https://jobkorea.co.kr", da: 71, countries: ["kr"], category: "Jobs" },
  { name: "Naver Kin KR", url: "https://kin.naver.com", da: 92, countries: ["kr"], category: "Q&A" },
  { name: "Clien KR", url: "https://clien.net", da: 67, countries: ["kr"], category: "Forum" },
  { name: "MLBPARK KR", url: "https://mlbpark.donga.com", da: 64, countries: ["kr"], category: "Forum" },
  { name: "Dcinside KR", url: "https://dcinside.com", da: 76, countries: ["kr"], category: "Community" },

  // ════════════════════════════════════════════════════════════════════
  // ── RUSSIA ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Avito RU", url: "https://avito.ru", da: 79, countries: ["ru"], category: "Classifieds" },
  { name: "YUla RU", url: "https://youla.ru", da: 71, countries: ["ru"], category: "Classifieds" },
  { name: "HeadHunter RU", url: "https://hh.ru", da: 78, countries: ["ru"], category: "Jobs" },
  { name: "SuperJob RU", url: "https://superjob.ru", da: 72, countries: ["ru"], category: "Jobs" },
  { name: "Cian RU", url: "https://cian.ru", da: 74, countries: ["ru"], category: "Directory" },
  { name: "LiveJournal RU", url: "https://livejournal.com", da: 91, countries: ["ru"], category: "Blog" },
  { name: "Habr RU", url: "https://habr.com", da: 80, countries: ["ru"], category: "Dev" },
  { name: "Pikabu RU", url: "https://pikabu.ru", da: 77, countries: ["ru"], category: "Community" },
  { name: "Mail.ru Communities", url: "https://my.mail.ru", da: 92, countries: ["ru"], category: "Social" },
  { name: "OK.ru RU", url: "https://ok.ru", da: 91, countries: ["ru"], category: "Social" },

  // ════════════════════════════════════════════════════════════════════
  // ── NETHERLANDS ───────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Marktplaats NL", url: "https://marktplaats.nl", da: 78, countries: ["nl"], category: "Classifieds" },
  { name: "Funda NL", url: "https://funda.nl", da: 81, countries: ["nl"], category: "Directory" },
  { name: "Independer NL", url: "https://independer.nl", da: 73, countries: ["nl"], category: "Directory" },
  { name: "Monsterboard NL", url: "https://monsterboard.nl", da: 70, countries: ["nl"], category: "Jobs" },
  { name: "Indeed NL", url: "https://nl.indeed.com", da: 93, countries: ["nl"], category: "Jobs" },
  { name: "Thuisbezorgd NL", url: "https://thuisbezorgd.nl", da: 74, countries: ["nl"], category: "E-Commerce" },
  { name: "Bol.com NL", url: "https://bol.com", da: 82, countries: ["nl"], category: "E-Commerce" },
  { name: "Cylex NL", url: "https://cylex.nl", da: 50, countries: ["nl"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── SWEDEN ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Blocket SE", url: "https://blocket.se", da: 76, countries: ["se"], category: "Classifieds" },
  { name: "Hemnet SE", url: "https://hemnet.se", da: 78, countries: ["se"], category: "Directory" },
  { name: "Arbetsformedlingen SE", url: "https://arbetsformedlingen.se", da: 80, countries: ["se"], category: "Jobs" },
  { name: "Eniro SE", url: "https://eniro.se", da: 71, countries: ["se"], category: "Directory" },
  { name: "Hitta SE", url: "https://hitta.se", da: 73, countries: ["se"], category: "Directory" },
  { name: "Reco.se SE", url: "https://reco.se", da: 67, countries: ["se"], category: "Directory" },
  { name: "Cylex SE", url: "https://cylex.se", da: 49, countries: ["se"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── POLAND ────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Poland", url: "https://olx.pl", da: 74, countries: ["pl"], category: "Classifieds" },
  { name: "Allegro PL", url: "https://allegro.pl", da: 80, countries: ["pl"], category: "E-Commerce" },
  { name: "Pracuj PL", url: "https://pracuj.pl", da: 72, countries: ["pl"], category: "Jobs" },
  { name: "Otodom PL", url: "https://otodom.pl", da: 73, countries: ["pl"], category: "Directory" },
  { name: "Gratka PL", url: "https://gratka.pl", da: 67, countries: ["pl"], category: "Classifieds" },
  { name: "Panorama Firm PL", url: "https://panoramafirm.pl", da: 71, countries: ["pl"], category: "Directory" },
  { name: "Cylex PL", url: "https://cylex.pl", da: 50, countries: ["pl"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── ARGENTINA ─────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "MercadoLibre AR", url: "https://mercadolibre.com.ar", da: 77, countries: ["ar"], category: "E-Commerce" },
  { name: "Zonaprop AR", url: "https://zonaprop.com.ar", da: 71, countries: ["ar"], category: "Directory" },
  { name: "Argenprop AR", url: "https://argenprop.com", da: 68, countries: ["ar"], category: "Directory" },
  { name: "Clasificados La Nacion AR", url: "https://clasificados.lanacion.com.ar", da: 74, countries: ["ar"], category: "Classifieds" },
  { name: "Bumeran AR", url: "https://bumeran.com.ar", da: 67, countries: ["ar"], category: "Jobs" },
  { name: "CompuTrabajo AR", url: "https://computrabajo.com.ar", da: 67, countries: ["ar"], category: "Jobs" },
  { name: "OLX Argentina", url: "https://olx.com.ar", da: 66, countries: ["ar"], category: "Classifieds" },
  { name: "Infobae AR", url: "https://infobae.com", da: 86, countries: ["ar"], category: "News" },
  { name: "Clarin AR", url: "https://clarin.com", da: 86, countries: ["ar"], category: "News" },
  { name: "La Nacion AR", url: "https://lanacion.com.ar", da: 82, countries: ["ar"], category: "News" },
  { name: "Taringa AR", url: "https://taringa.net", da: 79, countries: ["ar"], category: "Social" },
  { name: "Cylex AR", url: "https://cylex.com.ar", da: 49, countries: ["ar"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── COLOMBIA ──────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "OLX Colombia", url: "https://olx.com.co", da: 66, countries: ["co"], category: "Classifieds" },
  { name: "Finca Raiz CO", url: "https://fincaraiz.com.co", da: 69, countries: ["co"], category: "Directory" },
  { name: "Metrocuadrado CO", url: "https://metrocuadrado.com", da: 67, countries: ["co"], category: "Directory" },
  { name: "Computrabajo CO", url: "https://computrabajo.com.co", da: 67, countries: ["co"], category: "Jobs" },
  { name: "El Empleo CO", url: "https://elempleo.com", da: 64, countries: ["co"], category: "Jobs" },
  { name: "El Tiempo CO", url: "https://eltiempo.com", da: 83, countries: ["co"], category: "News" },
  { name: "El Espectador CO", url: "https://elespectador.com", da: 81, countries: ["co"], category: "News" },
  { name: "Cylex CO", url: "https://cylex.com.co", da: 48, countries: ["co"], category: "Directory" },

  // ════════════════════════════════════════════════════════════════════
  // ── SAUDI ARABIA ──────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Haraj SA", url: "https://haraj.com.sa", da: 68, countries: ["sa"], category: "Classifieds" },
  { name: "OLX Saudi", url: "https://olx.sa", da: 64, countries: ["sa"], category: "Classifieds" },
  { name: "Bayt SA", url: "https://bayt.com", da: 73, countries: ["sa"], category: "Jobs" },
  { name: "Tanqeeb SA", url: "https://tanqeeb.com", da: 57, countries: ["sa"], category: "Jobs" },
  { name: "Aqar SA", url: "https://aqar.com", da: 58, countries: ["sa"], category: "Directory" },
  { name: "Arab GT SA", url: "https://arabgt.com", da: 44, countries: ["sa"], category: "Directory" },
  { name: "Saudipage SA", url: "https://saudipage.com", da: 47, countries: ["sa"], category: "Directory" },
  { name: "Kooora SA", url: "https://kooora.com", da: 72, countries: ["sa"], category: "Community" },
  { name: "Elaph SA", url: "https://elaph.com", da: 71, countries: ["sa"], category: "News" },
  { name: "Saudi Gazette", url: "https://saudigazette.com.sa", da: 66, countries: ["sa"], category: "News" },

  // ════════════════════════════════════════════════════════════════════
  // ── GHANA ─────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════
  { name: "Jiji Ghana", url: "https://jiji.com.gh", da: 60, countries: ["gh"], category: "Classifieds" },
  { name: "Tonaton GH", url: "https://tonaton.com", da: 55, countries: ["gh"], category: "Classifieds" },
  { name: "Jobberman GH", url: "https://gh.jobberman.com", da: 55, countries: ["gh"], category: "Jobs" },
  { name: "BrighterMonday GH", url: "https://brightermonday.com.gh", da: 53, countries: ["gh"], category: "Jobs" },
  { name: "Meqasa GH", url: "https://meqasa.com", da: 49, countries: ["gh"], category: "Directory" },
  { name: "Ghana Yellow Pages", url: "https://yellowpages.com.gh", da: 47, countries: ["gh"], category: "Directory" },
  { name: "GhanaWeb", url: "https://ghanaweb.com", da: 70, countries: ["gh"], category: "News" },
  { name: "Graphic Ghana", url: "https://graphic.com.gh", da: 65, countries: ["gh"], category: "News" },

  // ── More Global – Directories & Communities ───────────────────────
  { name: "Kompass Global", url: "https://kompass.com", da: 74, countries: ["global"], category: "Business" },
  { name: "Europages", url: "https://europages.com", da: 70, countries: ["global"], category: "Business" },
  { name: "Alibaba", url: "https://alibaba.com", da: 95, countries: ["global"], category: "Business" },
  { name: "Global Sources", url: "https://globalsources.com", da: 73, countries: ["global"], category: "Business" },
  { name: "EC21", url: "https://ec21.com", da: 68, countries: ["global"], category: "Business" },
  { name: "Tradekey", url: "https://tradekey.com", da: 66, countries: ["global"], category: "Business" },
  { name: "ExportHub", url: "https://exporthub.com", da: 64, countries: ["global"], category: "Business" },
  { name: "eWorldTrade", url: "https://eworldtrade.com", da: 58, countries: ["global"], category: "Business" },
  { name: "Made-in-China", url: "https://made-in-china.com", da: 76, countries: ["global"], category: "Business" },
  { name: "DHgate", url: "https://dhgate.com", da: 82, countries: ["global"], category: "E-Commerce" },
  { name: "Amazon Seller", url: "https://sellercentral.amazon.com", da: 96, countries: ["global"], category: "E-Commerce" },
  { name: "eBay Seller", url: "https://ebay.com", da: 95, countries: ["global"], category: "E-Commerce" },
  { name: "Shopify", url: "https://shopify.com", da: 95, countries: ["global"], category: "Business" },
  { name: "BigCommerce", url: "https://bigcommerce.com", da: 89, countries: ["global"], category: "Business" },
  { name: "WooCommerce", url: "https://woocommerce.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Magento", url: "https://magento.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Squarespace", url: "https://squarespace.com", da: 94, countries: ["global"], category: "Blog" },
  { name: "Webflow", url: "https://webflow.com", da: 90, countries: ["global"], category: "Blog" },
  { name: "Notion", url: "https://notion.so", da: 90, countries: ["global"], category: "Content" },
  { name: "Confluence", url: "https://confluence.atlassian.com", da: 91, countries: ["global"], category: "Content" },
  { name: "Trello", url: "https://trello.com", da: 93, countries: ["global"], category: "Business" },
  { name: "Asana", url: "https://asana.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Monday.com", url: "https://monday.com", da: 90, countries: ["global"], category: "Business" },
  { name: "Basecamp", url: "https://basecamp.com", da: 88, countries: ["global"], category: "Business" },
  { name: "Slack", url: "https://slack.com", da: 95, countries: ["global"], category: "Business" },
  { name: "Discord", url: "https://discord.com", da: 94, countries: ["global"], category: "Community" },
  { name: "Telegram", url: "https://telegram.org", da: 93, countries: ["global"], category: "Social" },
  { name: "WhatsApp Business", url: "https://business.whatsapp.com", da: 96, countries: ["global"], category: "Social" },
  { name: "Mastodon", url: "https://mastodon.social", da: 87, countries: ["global"], category: "Social" },
  { name: "Bluesky", url: "https://bsky.app", da: 79, countries: ["global"], category: "Social" },
  { name: "Threads", url: "https://threads.net", da: 89, countries: ["global"], category: "Social" },
  { name: "Clubhouse", url: "https://clubhouse.com", da: 82, countries: ["global"], category: "Social" },
  { name: "Quora Space", url: "https://quora.com/spaces", da: 93, countries: ["global"], category: "Community" },
  { name: "Reddit Community", url: "https://reddit.com/r", da: 96, countries: ["global"], category: "Forum" },
  { name: "LinkedIn Groups", url: "https://linkedin.com/groups", da: 98, countries: ["global"], category: "Business" },
  { name: "Facebook Groups", url: "https://facebook.com/groups", da: 96, countries: ["global"], category: "Community" },
  { name: "Listly", url: "https://list.ly", da: 73, countries: ["global"], category: "Content" },
  { name: "Flipboard", url: "https://flipboard.com", da: 91, countries: ["global"], category: "Content" },
  { name: "Alltop", url: "https://alltop.com", da: 79, countries: ["global"], category: "Directory" },
  { name: "BlogCatalog", url: "https://blogcatalog.com", da: 72, countries: ["global"], category: "Blog" },
  { name: "Bloglines", url: "https://bloglines.com", da: 74, countries: ["global"], category: "Blog" },
  { name: "Technorati", url: "https://technorati.com", da: 81, countries: ["global"], category: "Blog" },
  { name: "Pingler", url: "https://pingler.com", da: 67, countries: ["global"], category: "Blog" },
  { name: "OnToplist", url: "https://ontoplist.com", da: 62, countries: ["global"], category: "Directory" },
  { name: "Addme.com", url: "https://addme.com", da: 60, countries: ["global"], category: "Directory" },
  { name: "Spoke Profile", url: "https://spoke.com", da: 71, countries: ["global"], category: "Profile" },
  { name: "Biz.NF", url: "https://biz.nf", da: 53, countries: ["global"], category: "Business" },
  { name: "Ibegin.com", url: "https://ibegin.com", da: 58, countries: ["global"], category: "Directory" },
  { name: "Openfaves", url: "https://openfaves.com", da: 59, countries: ["global"], category: "Social" },
  { name: "Yoono", url: "https://yoono.com", da: 54, countries: ["global"], category: "Social" },
  { name: "LivePerson", url: "https://liveperson.com", da: 80, countries: ["global"], category: "Business" },
  { name: "PitchBook", url: "https://pitchbook.com", da: 79, countries: ["global"], category: "Business" },
  { name: "Owler", url: "https://owler.com", da: 74, countries: ["global"], category: "Business" },
  { name: "CB Insights", url: "https://cbinsights.com", da: 83, countries: ["global"], category: "Business" },
  { name: "Semrush Blog", url: "https://semrush.com/blog", da: 91, countries: ["global"], category: "Dev" },
  { name: "Ahrefs Community", url: "https://ahrefs.com", da: 90, countries: ["global"], category: "Dev" },
  { name: "Neil Patel Community", url: "https://neilpatel.com", da: 88, countries: ["global"], category: "Dev" },
  { name: "Search Engine Journal", url: "https://searchenginejournal.com", da: 88, countries: ["global"], category: "Dev" },
  { name: "Search Engine Land", url: "https://searchengineland.com", da: 87, countries: ["global"], category: "Dev" },
  { name: "Moz Blog", url: "https://moz.com/blog", da: 91, countries: ["global"], category: "Dev" },
  { name: "SEMrush Forum", url: "https://semrush.com", da: 91, countries: ["global"], category: "Business" },
  { name: "Majestic", url: "https://majestic.com", da: 83, countries: ["global"], category: "Business" },
  { name: "SpyFu", url: "https://spyfu.com", da: 79, countries: ["global"], category: "Business" },
  { name: "Alexa (Web)", url: "https://alexa.com", da: 87, countries: ["global"], category: "Directory" },
  { name: "SimilarWeb", url: "https://similarweb.com", da: 88, countries: ["global"], category: "Business" },
  { name: "Craiglist Global", url: "https://craigslist.org", da: 89, countries: ["global"], category: "Classifieds" },
  { name: "Gigs Classifieds", url: "https://gigantic.com", da: 55, countries: ["global"], category: "Classifieds" },
  { name: "Classifiedads.com", url: "https://classifiedads.com", da: 67, countries: ["global"], category: "Classifieds" },
  { name: "Adpost.com", url: "https://adpost.com", da: 64, countries: ["global"], category: "Classifieds" },
  { name: "Backpage Alt", url: "https://oodle.com", da: 73, countries: ["global"], category: "Classifieds" },
  { name: "Locanto Global", url: "https://locanto.com", da: 67, countries: ["global"], category: "Classifieds" },
  { name: "Geebo", url: "https://geebo.com", da: 67, countries: ["global"], category: "Classifieds" },
  { name: "Trovit", url: "https://trovit.com", da: 78, countries: ["global"], category: "Classifieds" },
  { name: "Sulekha Global", url: "https://sulekha.com", da: 67, countries: ["global"], category: "Directory" },
  { name: "Hotfrog Global", url: "https://hotfrog.com", da: 64, countries: ["global"], category: "Directory" },
  { name: "Justia Lawyers", url: "https://justia.com", da: 81, countries: ["global"], category: "Directory" },
  { name: "Avvo", url: "https://avvo.com", da: 77, countries: ["global"], category: "Directory" },
  { name: "FindLaw", url: "https://findlaw.com", da: 84, countries: ["global"], category: "Directory" },
  { name: "Lawyers.com", url: "https://lawyers.com", da: 78, countries: ["global"], category: "Directory" },
  { name: "WebMD Profile", url: "https://webmd.com", da: 94, countries: ["global"], category: "Directory" },
  { name: "MedScape", url: "https://medscape.com", da: 88, countries: ["global"], category: "Directory" },
  { name: "HealthTap", url: "https://healthtap.com", da: 76, countries: ["global"], category: "Directory" },
  { name: "Wellness.com", url: "https://wellness.com", da: 71, countries: ["global"], category: "Directory" },
  { name: "RealSelf", url: "https://realself.com", da: 75, countries: ["global"], category: "Directory" },
  { name: "Angie's Reviews", url: "https://angieslist.com", da: 88, countries: ["global"], category: "Directory" },
  { name: "Porch.com", url: "https://porch.com", da: 72, countries: ["global"], category: "Directory" },
  { name: "HomeStars", url: "https://homestars.com", da: 69, countries: ["global"], category: "Directory" },
  { name: "Houzz Pros", url: "https://houzz.com/professionals", da: 91, countries: ["global"], category: "Directory" },
  { name: "Expertise.com", url: "https://expertise.com", da: 74, countries: ["global"], category: "Directory" },
  { name: "GoodFirms", url: "https://goodfirms.co", da: 74, countries: ["global"], category: "Business" },
  { name: "AgencySpotter", url: "https://agencyspotter.com", da: 66, countries: ["global"], category: "Business" },
  { name: "DesignRush", url: "https://designrush.com", da: 72, countries: ["global"], category: "Business" },
  { name: "Sortlist", url: "https://sortlist.com", da: 67, countries: ["global"], category: "Business" },
  { name: "UpCity", url: "https://upcity.com", da: 71, countries: ["global"], category: "Business" },
  { name: "Manifest", url: "https://themanifest.com", da: 72, countries: ["global"], category: "Business" },
  { name: "Bark.com", url: "https://bark.com", da: 72, countries: ["global"], category: "Business" },
  { name: "Bark Global", url: "https://bark.com/global", da: 72, countries: ["global"], category: "Business" },
  { name: "Thumbtack Pro", url: "https://thumbtack.com/pro", da: 84, countries: ["global"], category: "Business" },
  { name: "TaskRabbit", url: "https://taskrabbit.com", da: 83, countries: ["global"], category: "Business" },
  { name: "PeoplePerHour", url: "https://peopleperhour.com", da: 80, countries: ["global"], category: "Business" },
  { name: "Workana", url: "https://workana.com", da: 71, countries: ["global"], category: "Business" },
  { name: "99freejobs", url: "https://99freejobs.com", da: 45, countries: ["global"], category: "Jobs" },
  { name: "SimplyHired", url: "https://simplyhired.com", da: 84, countries: ["global"], category: "Jobs" },
  { name: "ZipRecruiter", url: "https://ziprecruiter.com", da: 87, countries: ["global"], category: "Jobs" },
  { name: "Dice.com", url: "https://dice.com", da: 84, countries: ["global"], category: "Jobs" },
  { name: "CareerBuilder", url: "https://careerbuilder.com", da: 84, countries: ["global"], category: "Jobs" },
  { name: "Vault.com", url: "https://vault.com", da: 78, countries: ["global"], category: "Jobs" },
  { name: "Ladders", url: "https://theladders.com", da: 77, countries: ["global"], category: "Jobs" },
  { name: "Hired.com", url: "https://hired.com", da: 76, countries: ["global"], category: "Jobs" },
  { name: "AngelList Jobs", url: "https://wellfound.com", da: 79, countries: ["global"], category: "Jobs" },
  { name: "Remote.co", url: "https://remote.co", da: 71, countries: ["global"], category: "Jobs" },
  { name: "We Work Remotely", url: "https://weworkremotely.com", da: 78, countries: ["global"], category: "Jobs" },
  { name: "Remote OK", url: "https://remoteok.com", da: 75, countries: ["global"], category: "Jobs" },
  { name: "Contra", url: "https://contra.com", da: 68, countries: ["global"], category: "Jobs" },
  { name: "Dribbble Jobs", url: "https://dribbble.com/jobs", da: 91, countries: ["global"], category: "Jobs" },
  { name: "Behance Jobs", url: "https://behance.net/joblist", da: 93, countries: ["global"], category: "Jobs" },
  { name: "99designs Pro", url: "https://99designs.com/designers", da: 87, countries: ["global"], category: "Creative" },
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
  { code: "br", name: "Brazil", flag: "🇧🇷" },
  { code: "mx", name: "Mexico", flag: "🇲🇽" },
  { code: "id", name: "Indonesia", flag: "🇮🇩" },
  { code: "my", name: "Malaysia", flag: "🇲🇾" },
  { code: "sg", name: "Singapore", flag: "🇸🇬" },
  { code: "th", name: "Thailand", flag: "🇹🇭" },
  { code: "vn", name: "Vietnam", flag: "🇻🇳" },
  { code: "tr", name: "Turkey", flag: "🇹🇷" },
  { code: "eg", name: "Egypt", flag: "🇪🇬" },
  { code: "ke", name: "Kenya", flag: "🇰🇪" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "jp", name: "Japan", flag: "🇯🇵" },
  { code: "kr", name: "South Korea", flag: "🇰🇷" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "pl", name: "Poland", flag: "🇵🇱" },
  { code: "ar", name: "Argentina", flag: "🇦🇷" },
  { code: "co", name: "Colombia", flag: "🇨🇴" },
  { code: "sa", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "gh", name: "Ghana", flag: "🇬🇭" },
];

const CATEGORIES = ["All", "Profile", "Social", "Blog", "Forum", "Directory", "Business", "Dev", "Creative", "Media", "Content", "Education", "Classifieds", "Jobs", "E-Commerce", "Community", "News", "Press Release", "Q&A"];

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
