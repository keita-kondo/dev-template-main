# OpenAPI自動化ガイド

## 概要

このテンプレートでは、OpenAPI仕様からTypeScript型定義を自動生成し、CI/CDパイプラインに統合することで、開発効率と品質を大幅に向上させています。

## 🚀 自動化機能

### 1. 型定義の自動生成
- OpenAPI仕様（YAML）からTypeScript型定義を自動生成
- API仕様と実装コードの型安全性を保証
- 手動での型定義作成を不要に

### 2. CI/CD統合
- GitHub Actionsによる自動化
- OpenAPI仕様の変更を検知して自動的に型定義を更新
- プルリクエストの自動作成

### 3. 開発時の自動化
- ファイル監視によるリアルタイム型定義更新
- バリデーション機能
- APIドキュメントの自動生成

## 📋 使用方法

### ローカル開発

1. **型定義の生成**
   ```bash
   cd api-service-template
   npm run generate-types
   ```

2. **OpenAPI仕様の監視**
   ```bash
   npm run watch-openapi
   ```

3. **OpenAPI仕様の検証**
   ```bash
   npm run validate-openapi
   ```

### CI/CD自動化

#### 自動化ワークフロー

1. **OpenAPI Automation** (`openapi-automation.yml`)
   - OpenAPI仕様の変更を検知
   - 型定義の自動生成
   - APIドキュメントの生成
   - アーティファクトの保存

2. **OpenAPI Sync** (`openapi-sync.yml`)
   - OpenAPI仕様の変更を検知
   - 型定義の自動更新
   - プルリクエストの自動作成

3. **Node.js CI** (`node.js.yml`)
   - 既存のCIワークフローにOpenAPI自動化を統合
   - ビルド前に型定義を自動生成

## 🔧 設定ファイル

### package.json スクリプト
```json
{
  "scripts": {
    "generate-types": "openapi-typescript ../openapi-api-template/openapi.yaml --output src/types.ts",
    "watch-openapi": "nodemon --watch ../openapi-api-template/openapi.yaml --exec npm run generate-types",
    "validate-openapi": "swagger-parser validate ../openapi-api-template/openapi.yaml"
  }
}
```

### nodemon.json
```json
{
  "watch": ["../openapi-api-template/openapi.yaml"],
  "ext": "yaml,yml",
  "ignore": ["src/types.ts"],
  "exec": "npm run generate-types"
}
```

## 📊 自動化の効果

### 開発効率の向上
- **型定義作成時間**: 数時間 → 数秒
- **API仕様と実装の整合性**: 手動確認 → 自動保証
- **エラー検出**: 実行時 → コンパイル時

### 品質向上
- **型安全性**: 100%保証
- **API仕様の一貫性**: 自動検証
- **ドキュメント**: 自動生成

### チーム開発での利点
- **標準化**: 全プロジェクトで統一された型定義
- **学習コスト**: 型定義作成の知識不要
- **保守性**: 仕様変更時の自動更新

## 🎯 使用例

### 新しいAPIエンドポイントの追加

1. **OpenAPI仕様を更新**
   ```yaml
   paths:
     /new-endpoint:
       get:
         parameters:
           - name: param1
         responses:
           200:
             content:
               application/json:
                 schema:
                   $ref: '#/components/schemas/NewResponse'
   ```

2. **型定義が自動生成される**
   ```typescript
   // src/types.ts に自動追加
   "/new-endpoint": {
     get: {
       parameters: {
         query: {
           param1: string;
         };
       };
       responses: {
         200: {
           content: {
             "application/json": components["schemas"]["NewResponse"];
           };
         };
       };
     };
   }
   ```

3. **実装で型安全に使用**
   ```typescript
   type NewResponse = paths["/new-endpoint"]["get"]["responses"]["200"]["content"]["application/json"];
   
   const result: NewResponse = {
     // 型安全な実装
   };
   ```

## 🔍 トラブルシューティング

### よくある問題

1. **型定義が更新されない**
   ```bash
   npm run validate-openapi  # OpenAPI仕様を検証
   npm run generate-types    # 手動で型定義を生成
   ```

2. **CI/CDが失敗する**
   - OpenAPI仕様の構文エラーを確認
   - 依存関係のインストール状況を確認

3. **型の不一致**
   - OpenAPI仕様と実装コードの整合性を確認
   - 型定義を再生成

## 📈 今後の拡張予定

- [ ] OpenAPI仕様からのテストコード自動生成
- [ ] クライアントコードの自動生成
- [ ] APIモックサーバーの自動生成
- [ ] 型定義の差分表示機能
- [ ] 複数言語対応（Java, Python等）

## 📚 参考資料

- [OpenAPI Specification](https://swagger.io/specification/)
- [openapi-typescript](https://github.com/drwpow/openapi-typescript)
- [Swagger Parser](https://github.com/APIDevTools/swagger-parser)
- [Redocly](https://redocly.com/) 