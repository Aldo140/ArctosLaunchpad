/**
 * Sources a news or opinion post may rest on before it goes out with nobody
 * checking it: governments, police and established newsrooms. Anything else
 * (social media, blogs, unknown sites) still waits for a person.
 */
const CREDIBLE = [
  // Governments, police and public agencies
  'calgary.ca', 'alberta.ca', 'canada.ca', 'gc.ca', 'calgarypolice.ca', 'rcmp-grc.gc.ca', 'ahs.ca', 'albertahealthservices.ca',
  'calgarytransit.com', 'yyc.com', 'cbe.ab.ca', 'cssd.ab.ca', 'elections.ab.ca', 'elections.ca', 'parl.ca', 'ucalgary.ca',
  // Newsrooms
  'cbc.ca', 'calgaryherald.com', 'calgarysun.com', 'globalnews.ca', 'ctvnews.ca', 'citynews.ca', 'livewirecalgary.com',
  'avenuecalgary.com', 'dailyhive.com', 'narcity.com', 'theglobeandmail.com', 'nationalpost.com', 'thecanadianpress.com',
  'cp24.com', 'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk', 'theweathernetwork.com', 'cochranetoday.ca', 'airdrietoday.com',
  'okotoksonline.com', 'rmoutlook.com', 'thestar.com', 'edmontonjournal.com', 'tourismcalgary.com',
];

/** Whether one URL is https on a credible domain (or a subdomain of one, e.g. newsroom.calgary.ca). */
export function credibleSource(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    return u.protocol === 'https:' && CREDIBLE.some(d => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** A post's sources are credible when it has at least one and every one is. */
export const credibleSources = (urls: string[] | undefined) => !!urls?.length && urls.every(credibleSource);
