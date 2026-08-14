# Event Chat

イベント参加者向けのリアルタイムチャットアプリです。

## Features

- イベント作成
- イベント一覧
- イベントへの参加
- メッセージ投稿
- リアルタイムチャット

## Tech Stack

- React
- TypeScript
- FastAPI
- PostgreSQL
- WebSocket

## Architecture

Frontend → FastAPI → PostgreSQL
              ↕
          WebSocket

## 実装済み機能
 - イベント作成 
 - イベント一覧取得
 - PostgreSQLへのイベント保存
 - メッセージ投稿
 - イベントごとのメッセージ取得
 - WebSocketによるリアルタイム通信