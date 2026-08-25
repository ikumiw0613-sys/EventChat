# Event Chat

イベント参加者向けのリアルタイムチャットアプリです。イベントの作成・一覧取得、イベントごとのメッセージ保存、WebSocketによるリアルタイム通信を提供します。

## 主な機能

- イベントの作成と一覧表示
- イベントごとのメッセージ投稿・履歴取得
- WebSocketによるリアルタイムメッセージ配信
- PostgreSQLへのイベントとメッセージの保存

> [!NOTE]
> 現在、フロントエンドで表示できるのはイベント一覧までです。イベント作成とチャットは、FastAPIのSwagger UIまたはAPI/WebSocketクライアントから試せます。

## 使用技術

- フロントエンド: React、TypeScript、Vite、React Router
- バックエンド: FastAPI、SQLModel、Uvicorn
- データベース: PostgreSQL
- リアルタイム通信: WebSocket

## 必要な環境

- Node.js 20以上
- Python 3.10以上
- PostgreSQL

## セットアップ

### 1. PostgreSQLを準備する

PostgreSQLで、このアプリが使用するデータベースを作成します。以下ではデータベース名を `event_chat` とします。

### 2. バックエンドを準備する

`backend` ディレクトリに移動し、仮想環境を作成して依存パッケージをインストールします。

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" sqlmodel "psycopg[binary]" python-dotenv
```

`backend/.env` を作成し、PostgreSQLへの接続情報を設定します。

```dotenv
DATABASE_URL=postgresql+psycopg://ユーザー名:パスワード@localhost:5432/event_chat
```

### 3. フロントエンドを準備する

別のターミナルで `frontend` ディレクトリに移動し、依存パッケージをインストールします。

```powershell
cd frontend
npm install
```

## 起動方法

### バックエンド

`backend` ディレクトリで次のコマンドを実行します。

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

APIは `http://127.0.0.1:8000` で起動します。初回起動時に必要なテーブルが自動作成されます。

### フロントエンド

別のターミナルの `frontend` ディレクトリで次のコマンドを実行します。

```powershell
npm run dev
```

ターミナルに表示されたURL（通常は `http://localhost:5173`）をブラウザで開きます。

## 使い方

### イベントを作成する

ブラウザでSwagger UI（`http://127.0.0.1:8000/docs`）を開きます。`POST /events` の **Try it out** を選択し、次のようなJSONを送信します。

```json
{
  "name": "夏祭り"
}
```

### イベント一覧を見る

フロントエンドのトップページを開くと、登録済みのイベントが一覧表示されます。APIを直接利用する場合は `GET /events` を実行します。

### メッセージを操作する

現時点ではSwagger UIから次のAPIを利用できます。

- `POST /events/{event_id}/messages`: メッセージを投稿する
- `GET /events/{event_id}/messages`: イベントのメッセージ履歴を取得する

投稿するJSONの例です。

```json
{
  "event_id": 1,
  "username": "山田",
  "content": "こんにちは！"
}
```

リアルタイム通信を試す場合は、WebSocketクライアントから `ws://127.0.0.1:8000/ws/events/{event_id}` に接続し、次のJSONを送信します。

```json
{
  "username": "山田",
  "content": "リアルタイムメッセージです"
}
```

同じイベントIDに接続しているすべてのクライアントにメッセージが配信され、データベースにも保存されます。

## API一覧

| メソッド | パス | 内容 |
| --- | --- | --- |
| `GET` | `/events` | イベント一覧を取得 |
| `POST` | `/events` | イベントを作成 |
| `GET` | `/events/{event_id}` | イベントを1件取得 |
| `GET` | `/events/{event_id}/messages` | メッセージ履歴を取得 |
| `POST` | `/events/{event_id}/messages` | メッセージを投稿 |
| `WebSocket` | `/ws/events/{event_id}` | リアルタイムチャットに接続 |

## ディレクトリ構成

```text
EventChat/
├─ backend/
│  └─ app/
│     ├─ main.py       # APIとWebSocket
│     ├─ models.py     # データモデル
│     └─ database.py   # PostgreSQL接続
└─ frontend/
   └─ src/
      ├─ pages/        # イベント一覧・チャット画面
      ├─ App.tsx       # ルーティング
      └─ main.tsx      # エントリーポイント
```

## 補足

- バックエンドとフロントエンドの両方を起動して使用してください。
- フロントエンドはバックエンドが `127.0.0.1:8000` で動作する前提です。
- `.env` には認証情報が含まれるため、Gitにコミットしないでください。
