# EventChat

イベントごとのチャットルームを作成し、参加者同士でリアルタイムにメッセージをやり取りできるWebアプリケーションです。

## 主な機能

- イベントの作成と一覧表示
- 表示名を入力してイベントのチャットへ参加
- 過去のメッセージ履歴の表示
- WebSocketによるリアルタイムメッセージ配信
- PostgreSQLへのイベント・メッセージ保存

## 使用技術

- フロントエンド: React 19、TypeScript、Vite、React Router
- バックエンド: FastAPI、SQLModel、Uvicorn
- データベース: PostgreSQL
- リアルタイム通信: WebSocket

## 必要な環境

- Node.js 20以上
- Python 3.10以上
- PostgreSQL

## セットアップ

以下のコマンドは、`backend` と `frontend` があるプロジェクトルートから実行します。

### 1. PostgreSQLを準備する

PostgreSQLに、このアプリケーションで使用するデータベースを作成します。以下ではデータベース名を `event_chat` とします。

### 2. バックエンドを準備する

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" sqlmodel "psycopg[binary]" python-dotenv
```

`backend/.env` を作成し、PostgreSQLの接続情報を設定します。プロジェクトルートの `.env.example` をひな形として利用できます。

```dotenv
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/event_chat
```

### 3. フロントエンドを準備する

プロジェクトルートへ戻り、依存パッケージをインストールします。

```powershell
cd ..\frontend
npm install
```

APIの接続先を変更する場合は、`frontend/.env` に次の環境変数を設定します。未設定時は下記の値が使用されます。

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WEBSOCKET_BASE_URL=ws://127.0.0.1:8000
```

## 起動方法

### バックエンド

プロジェクトルートで次のコマンドを実行します。仮想環境を手動で有効化する必要はありません。

```powershell
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir backend
```

APIは `http://127.0.0.1:8000`、Swagger UIは `http://127.0.0.1:8000/docs` で開けます。初回起動時に必要なテーブルが自動作成されます。

### フロントエンド

別のターミナルを開き、プロジェクトルートで次のコマンドを実行します。

```powershell
npm --prefix frontend run dev
```

ターミナルに表示されるURL（通常は `http://localhost:5173`）をブラウザで開きます。

## 使い方

1. トップページでイベント名を入力し、「イベント作成」を選択します。
2. 作成済みイベントの「チャットに参加」を選択します。
3. 表示名を入力して参加します。
4. メッセージを入力し、「送信」を選択するか Enter キーを押します。

同じイベントを開いている参加者へメッセージがリアルタイムに配信され、データベースにも保存されます。

## API一覧

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

WebSocketでも、メッセージ投稿時と同じ形式のJSONを送信します。

## ディレクトリ構成

```text
イベントチャット/
├── backend/
│   └── app/
│       ├── main.py       # APIとWebSocket
│       ├── models.py     # データモデル
│       └── database.py   # PostgreSQL接続
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/        # イベント一覧・チャット画面
│       ├── api.ts        # API/WebSocket接続設定
│       ├── App.tsx       # ルーティング
│       └── main.tsx      # エントリーポイント
├── .env.example
└── README.md
```

## 注意事項

- バックエンドとフロントエンドの両方を起動して使用してください。
- フロントエンドは、既定ではバックエンドが `127.0.0.1:8000` で動作する前提です。
- `.env` には認証情報が含まれるため、Gitへコミットしないでください。
