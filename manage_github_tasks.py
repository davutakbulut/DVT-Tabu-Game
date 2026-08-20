#!/usr/bin/env python3
"""
GitHub Project 4 Issue & Task Transition Helper for DVT Tabu Game
Moves issues between Todo -> In Progress -> Done
"""

import sys
import os
import urllib.request
import json

TOKEN = os.environ.get("GITHUB_TOKEN", "YOUR_GITHUB_TOKEN")
PROJECT_ID = "PVT_kwHOAsupAs4Bg4u5"
STATUS_FIELD_ID = "PVTSSF_lAHOAsupAs4Bg4u5zhf2mKg"

STATUS_MAP = {
    "todo": "f75ad846",
    "in_progress": "47fc9ee4",
    "done": "98236657"
}

headers = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "DVT-Tabu-Manager"
}

def run_graphql(query, variables=None):
    data = json.dumps({"query": query, "variables": variables or {}}).encode("utf-8")
    req = urllib.request.Request("https://api.github.com/graphql", data=data, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def list_items():
    query = """
    query {
      node(id: "PVT_kwHOAsupAs4Bg4u5") {
        ... on ProjectV2 {
          items(first: 50) {
            nodes {
              id
              fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  optionId
                }
              }
              content {
                ... on Issue {
                  number
                  title
                  url
                }
              }
            }
          }
        }
      }
    }
    """
    res = run_graphql(query)
    items = res.get("data", {}).get("node", {}).get("items", {}).get("nodes", [])
    print(f"\n📋 GitHub Project Board Durumu (Toplam {len(items)} Görev):")
    print("-" * 75)
    for it in items:
        status = it.get("fieldValueByName", {})
        status_name = status.get("name", "Bilinmiyor") if status else "None"
        content = it.get("content", {})
        num = content.get("number", "?")
        title = content.get("title", "İsimsiz")
        print(f"[{status_name:^12}] #{num:<3} {title[:55]}")
    print("-" * 75)
    return items

def move_issue_status(issue_number: int, target_status: str, all_items=None):
    target_status = target_status.lower()
    if target_status not in STATUS_MAP:
        print(f"Hata: Geçersiz durum '{target_status}'. Seçenekler: todo, in_progress, done")
        return

    option_id = STATUS_MAP[target_status]
    items = all_items if all_items is not None else list_items()
    target_item = None
    for it in items:
        content = it.get("content", {})
        if content and content.get("number") == issue_number:
            target_item = it
            break

    if not target_item:
        print(f"Hata: Issue #{issue_number} panoda bulunamadı.")
        return

    item_id = target_item["id"]
    mutation = """
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
        updateProjectV2ItemFieldValue(
            input: {
                projectId: $projectId
                itemId: $itemId
                fieldId: $fieldId
                value: { singleSelectOptionId: $value }
            }
        ) {
            projectV2Item {
                id
            }
        }
    }
    """
    res = run_graphql(mutation, {
        "projectId": PROJECT_ID,
        "itemId": item_id,
        "fieldId": STATUS_FIELD_ID,
        "value": option_id
    })
    print(f"✅ Issue #{issue_number} başarıyla '{target_status.upper()}' durumuna taşındı!")

if __name__ == "__main__":
    if len(sys.argv) == 1:
        list_items()
    elif len(sys.argv) == 3:
        issue_num = int(sys.argv[1])
        status = sys.argv[2]
        move_issue_status(issue_num, status)
    else:
        print("Kullanım:")
        print("  python3 manage_github_tasks.py                   # Tüm panoyu listeler")
        print("  python3 manage_github_tasks.py 1 in_progress     # Issue #1'i In Progress yapar")
        print("  python3 manage_github_tasks.py 1 done            # Issue #1'i Done yapar")
