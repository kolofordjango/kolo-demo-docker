import requests
from typing import Dict, Any

from django.http import HttpRequest, JsonResponse

from .models import User, Repository


def extract_username(request: HttpRequest) -> str:
    return request.GET.get("username", "wilhelmklopp")


def github_api_call(path: str) -> Dict[str, Any]:
    url = f"https://api.github.com{path}"
    response = requests.get(url)

    return response.json()


def demo(request: HttpRequest) -> JsonResponse:
    username = extract_username(request)

    github_user = github_api_call(f"/users/{username}")
    repositories = github_api_call(f"/users/{username}/repos")

    user, user_created = User.objects.get_or_create(
        github_id=github_user["id"], defaults={"login": github_user["login"]}
    )

    total_repositories = len(repositories)
    newly_created_count = 0
    for repository in repositories:
        repo, repo_created = Repository.objects.get_or_create(
            github_id=repository["id"],
            user=user,
            defaults={"name": repository["full_name"]},
        )
        if repo_created:
            newly_created_count += 1

    return JsonResponse(
        {
            "user": {"internal_id": user.id, "github_id": user.github_id},
            "total_repositories": total_repositories,
            "newly_created_repositories": newly_created_count,
        }
    )
