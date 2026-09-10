# GE Addon 기능 현황

공개 화면에는 기능명, 상태, 진행률, 게시 시각만 둔다. 소스·경로·주소·커밋·사용자 정보는 게시하지 않는다.

상태 변경은 `status.json`을 손으로 따로 고치지 않고 아래 명령으로 수행한다.

```powershell
node update-status.mjs status.json --feature "기능명" --status "작업 중" --progress 50 --turn Claude
node validate-status.mjs status.json
```

검증 후 `main`에 푸시하면 GitHub Pages가 갱신된다. 기능 상태가 바뀐 작업은 이 갱신까지 끝나야 완료다.
