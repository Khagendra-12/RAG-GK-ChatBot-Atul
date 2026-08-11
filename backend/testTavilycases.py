from search import search_web

TEST_CASES = [
    {
        "name": "time_sensitive",
        "query": "current stock price of Apple today",
        "check": "Does published_date come back? Note if it's None.",
    },
    {
        "name": "ambiguous_broad",
        "query": "latest news",
        "check": "How noisy/unfocused are the results?",
    },
    {
        "name": "obscure_or_fake",
        "query": "the quarterly earnings report of Zyxtron Dynamics Corp",
        "check": "Does it return empty/irrelevant results without crashing?",
    },
    {
        "name": "normal_gk",
        "query": "who is the current secretary general of the United Nations",
        "check": "Baseline case — should return clean, relevant results.",
    },
]


def run_case(case: dict):
    print(f"\n{'=' * 70}")
    print(f"CASE: {case['name']}")
    print(f"Query: {case['query']}")
    print(f"Watching for: {case['check']}")
    print("=" * 70)

    results = search_web(case["query"], max_results=5)

    if not results:
        print("-> No results returned (empty list). Confirm this didn't crash — that's the point of this case if it's 'obscure_or_fake'.")
        return

    print(f"-> {len(results)} results returned\n")
    for i, r in enumerate(results, 1):
        print(f"[{i}] {r['title']}")
        print(f"    URL: {r['url']}")
        print(f"    Published: {r['published_date']}")
        print(f"    Text preview: {r['text'][:150]}...")
        print()


if __name__ == "__main__":
    for case in TEST_CASES:
        try:
            run_case(case)
        except Exception as e:
            print(f"\n!! CASE '{case['name']}' RAISED AN EXCEPTION: {e}")
            print("This is a real bug to fix — search_web should never crash the pipeline, even on bad queries.\n")

    print("\n" + "=" * 70)
    print("Done. Check https://app.tavily.com for credit usage after this run")
    print("so you know the real cost of basic vs advanced search_depth.")
    print("=" * 70)