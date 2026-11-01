"""Saves Shravan's public GitHub contribution graph to data/github.json for the projects page.

Run by .github/workflows/github-contributions.yml every night. It asks GitHub's API (GraphQL) for the
last year of daily contribution counts, using the job's built-in token. If that fails it falls
back to the public contributions page that github.com/shhravan shows.

data/github.json looks like:
  {"user": "shhravan", "total": 382, "updated": "2026-11-01",
   "days": [["2025-11-02", 0, 0], ["2025-11-03", 4, 2], ...]}   # date, count, level 0-4
"""
import datetime, json, os, re, sys, urllib.request

USER = os.environ.get("GITHUB_USER", "shhravan")
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "github.json")
LEVELS = {"NONE": 0, "FIRST_QUARTILE": 1, "SECOND_QUARTILE": 2, "THIRD_QUARTILE": 3, "FOURTH_QUARTILE": 4}

QUERY = """query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
  totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }"""


def from_api(token):
    body = json.dumps({"query": QUERY, "variables": {"login": USER}}).encode()
    req = urllib.request.Request("https://api.github.com/graphql", body, {
        "Authorization": "Bearer " + token, "Content-Type": "application/json", "User-Agent": "shravanlad.com"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    cal = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
    days = [[d["date"], d["contributionCount"], LEVELS.get(d["contributionLevel"], 0)]
            for w in cal["weeks"] for d in w["contributionDays"]]
    return cal["totalContributions"], days


def parse_page(html):
    """Reads the counts out of github.com/users/NAME/contributions (the graph on a profile)."""
    cells = re.findall(r'<td[^>]*data-date="(\d{4}-\d\d-\d\d)"[^>]*id="([^"]+)"[^>]*data-level="(\d)"', html)
    if not cells:  # attribute order varies
        cells = [(d, i, l) for i, d, l in re.findall(r'<td[^>]*id="([^"]+)"[^>]*data-date="(\d{4}-\d\d-\d\d)"[^>]*data-level="(\d)"', html)]
    tips = dict(re.findall(r'<tool-tip[^>]*for="([^"]+)"[^>]*>\s*([^<]*)</tool-tip>', html))
    days = []
    for date, cid, level in cells:
        m = re.match(r"(\d+) contribution", tips.get(cid, ""))
        days.append([date, int(m.group(1)) if m else 0, int(level)])
    days.sort()
    return sum(d[1] for d in days), days


def from_page():
    req = urllib.request.Request(f"https://github.com/users/{USER}/contributions", headers={"User-Agent": "shravanlad.com"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return parse_page(r.read().decode("utf-8", "replace"))


def main():
    token = os.environ.get("GITHUB_TOKEN")
    try:
        if not token:
            raise RuntimeError("no token")
        total, days = from_api(token)
    except Exception as e:
        print("API didn't work (" + str(e) + "); reading the public page instead.")
        total, days = from_page()
    if len(days) < 300:
        sys.exit(f"Only got {len(days)} days; leaving data/github.json as it was.")
    out = {"user": USER, "total": total, "updated": datetime.date.today().isoformat(), "days": days}
    with open(OUT, "w") as f:
        json.dump(out, f, separators=(",", ":"))
        f.write("\n")
    print(f"{total} contributions over {len(days)} days saved.")


if __name__ == "__main__":
    main()
