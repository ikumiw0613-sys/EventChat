# EventChat

イベントごとのチャットルームを作成し、参加者同士でリアルタイムにメッセージをやり取りできるWebアプリケーションです。

## 主な機能

- イベントの作成と一覧表示
- 表示名を入力してイベントのチャットへ参加
- 過去のメッセージ履歴の表示
- WebSocket によるリアルタイムメッセージ配信
- PostgreSQL へのイベント・メッセージ保存

## 使用技術

- フロントエンド: React 19、TypeScript、Vite
- バックエンド: FastAPI、SQLModel、Uvicorn
- データベース: PostgreSQL
- リアルタイム通信: WebSocket
- 実行環境: Docker Compose

## 必要な環境

- Docker Desktop / Docker Engine
- Docker Compose
- （ローカル開発時のみ）Node.js 20以上、Python 3.10以上

## クイックスタート

プロジェクトルートで次を実行します。

```bash
docker compose up --build
```

起動後は以下にアクセスできます。

- フロントエンド: http://localhost:5173
- バックエンド API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

初回起動時に PostgreSQL と FastAPI のコンテナが自動的に起動し、必要なテーブルも自動作成されます。

## コンテナ構成

このプロジェクトでは、以下の 3 つのサービスを Docker Compose で管理しています。

- `db`: PostgreSQL 18
- `backend`: FastAPI アプリ
- `frontend`: Vite + React アプリ

設定はルートの `compose.yaml` に定義されています。

### 主要なポート

| サービス | ポート | 用途 |
| --- | --- | --- |
| PostgreSQL | 5432 | データベース接続 |
| Backend | 8000 | FastAPI API |
| Frontend | 5173 | Web UI |

## ローカル開発（Docker を使わない場合）

Docker を使わずに手動で起動する場合は、次の手順を実行します。

### 1. PostgreSQL を準備する

PostgreSQL に `event_chat` という名前のデータベースを作成します。

### 2. バックエンドを準備する

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`backend/.env` を作成し、接続先を設定します。雛形はルートの `.env.example` を利用できます。

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/event_chat
```

### 3. フロントエンドを準備する

```bash
cd frontend
npm install
```

必要に応じて `frontend/.env` を作成し、バックエンドの URL を上書きできます。

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WEBSOCKET_BASE_URL=ws://127.0.0.1:8000
```

### 4. 起動

バックエンド:

```bash
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend
```

フロントエンド:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

## 停止・初期化

```bash
docker compose down
```

データベースの保存内容も消したい場合は、次を実行します。

```bash
docker compose down -v
```

## 使い方

1. トップページでイベント名を入力し、「イベント作成」を選択します。
2. 作成済みイベントの「チャットに参加」を選択します。
3. 表示名を入力して参加します。
4. メッセージを入力し、「送信」を選択するか Enter キーを押します。

同じイベントを開いている参加者へメッセージがリアルタイムに配信され、データベースにも保存されます。

## API 一覧

| メソッド | パス | 内容 |
| --- | --- | --- |
| `GET` | `/events` | イベント一覧を取得 |
| `POST` | `/events` | イベントを作成 |
| `GET` | `/events/{event_id}` | イベントを1件取得 |
| `GET` | `/events/{event_id}/messages` | メッセージ履歴を取得 |
| `POST` | `/events/{event_id}/messages` | メッセージを投稿 |
| `WebSocket` | `/ws/events/{event_id}` | イベントのリアルタイムチャットに接続 |

イベント作成時のリクエスト例:

```json
{
  "name": "夏祭り"
}
```

メッセージ投稿時のリクエスト例:

```json
{
  "username": "山田",
  "content": "こんにちは！"
}
```

WebSocket でも、メッセージ投稿時と同じ形式の JSON を送信します。

## ディレクトリ構成

```text
EventChat/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── database.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── tests/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── compose.yaml
├── .env.example
├── README.md
└── .gitignore
```

## 注意事項

- Docker を利用した起動が基本です。ローカル開発でも `backend/.env` と `frontend/.env` を使えます。
- フロントエンドは既定ではバックエンドの URL を `http://127.0.0.1:8000` と見なして接続します。
- Docker 環境ではサービス名 `db` を使って接続しています。
- `.env` には認証情報や接続先が含まれるため、Git へコミットしないでください。


## 工夫した点 
- FastAPIを利用してDBと接続させた
- WebSocketを利用してリアルタイムで更新できるようにした
- チャット画面をReactで作成した

## 今後追加したい機能
- スタンプ機能
- リアクション機能
- イベントの概要ページ
- adminページ