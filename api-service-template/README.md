# APIの実装テンプレート

TODO: Typescriptに対象言語を変更した影響でリポジトリの構成がおかしくなってる。調整する。

## テンプレートの利用方法

【考慮事項】どこまでをテンプレート化できるか 

## テンプレートを利用せずAPIの実装環境を構築する方法

### 前提

nodejsがインストールされていること。

プロジェクトがないところから実装とテストのサンプルを用意し実行するところまで手順として記載している為、適宜必要な箇所のみ実施すること。

### リポジトリ用のディレクトリを生成する。

コマンドプロンプトを開き、作業ディレクトリまで移動し、以下コマンドを実行。

```cmd
mkdir <作成するディレクトリ名>
cd <作成するディレクトリ名>
mkdir src,__tests__
```

### Node.js プロジェクトを生成する。

以下コマンドを実行。

```cmd
npm init -y
```

### 関連するライブラリをインストールする

以下コマンドを実行。

```cmd
npm install --save-dev typescript jest ts-jest @types/jest eslint prettier
```

### プロジェクトのコンパイラ設定ファイルを作成する

以下コマンドを実行。

```cmd
npx tsc --init
```

### テストクラス設定ファイルを作成する

以下コマンドを実行。

```cmd
npx ts-jest config:init
```

### srcへソースファイルを配置する(サンプルソース)

service.ts
```ts
/**
 * 2つの数値を加算して返す関数
 */
export function addNumbers(a: number, b: number): number {
  return a + b;
}
```

### __tests__へテストソースファイルを配置する(サンプルソース)

service.test.ts
```ts
import { addNumbers } from '../src/service';

describe('addNumbers', () => {
  test('正の整数の加算', () => {
    expect(addNumbers(2, 3)).toBe(5);
  });

  test('負の数の加算', () => {
    expect(addNumbers(-4, -6)).toBe(-10);
  });

  test('0の加算', () => {
    expect(addNumbers(0, 0)).toBe(0);
  });

  test('小数の加算', () => {
    expect(addNumbers(1.5, 2.3)).toBeCloseTo(3.8);
  });
});
```

###  コンパイルの実行

以下コマンドを実行。

```cmd
npx tsc
```

### テストの実行

以下コマンドを実行。

```cmd
npx jest
```

### git等のリポジトリにて管理対象とすべきファイル

```cmd
__test__
src/
package.json
package-lock.json または yarn.lock
tsconfig.json
.gitignore(管理対象から除外するファイルを管理するファイル)
```

### lambda稼働を前提としたAPIの実装

aws-lambdaのモジュールを追加インストールする。

```ts
npm install --save-dev @types/aws-lambda
```

起動対象となるhandler.tsを作成する。

handler.ts

lambdaで実行する場合、handler.jsをルート（一番上の階層）へ配置する必要がある。

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { addNumbers } from './service';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const query = event.queryStringParameters || {};

  const a = parseFloat(query.a || '');
  const b = parseFloat(query.b || '');

  if (isNaN(a) || isNaN(b)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid or missing parameters: a, b' }),
    };
  }

  const result = addNumbers(a, b);

  return {
    statusCode: 200,
    body: JSON.stringify({ result }),
  };
};
```

### lambdaへアップロードする際のディレクトリ構成

そのままコンパイルした場合、以下の構成となる
```cmd
project/
├── src/
│   └── ...（元の TypeScript ファイル）
│   └── ...（コンパイルされたJS他）
├── __test__/
│   └── ...（テストソース）
├── node_modules/
├── tsconfig.json
├── package.json
...
```

コンパイル後の成果物を以下の構成へ変更し圧縮後、lambdaへアップロードする。
```cmd
project/
├── handler.js (handlerが含まれているソースコード)
├── ... .js
├── node_modules/（依存あれば）
├── package.json（任意）
...
```

### OpenAPIファイル（yaml）からIFコードを生成する

#### サンプル仕様

HTTPメソッド：Get  
パラメータ：クエリパラメータnum1,num2  
エンドポイント：/sample-calc
レスポンス内容は以下とする
- date：実行日時
- calc-result：パラメータnum1,num2の加算値  

エラーレスポンスは以下とする  
- code：エラーコード
- message：エラーメッセージ  
  

#### openapi-typescriptを導入する

サンプルコードを利用する場合、openapi-api-template配下で実施する。

```cmd
npm install --save-dev openapi-typescript
```

#### IFコードを生成する

サンプルコードを利用する場合、openapi-api-template配下で実施する。

（IFコード）type.tsを生成する

```cmd
npx openapi-typescript ./openapi.yaml --output ../api-service-template/src/types.ts
```

### IFコードを組み込んだlambdaの起動対象クラス（handler.ts）を作成する

#### 関連ライブラリを生成する
```cmd
npm install --save-dev @types/aws-lambda
```

#### 起動対象クラスを作成する

handler.ts

```js
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { paths } from "./types";
import { addNumbers } from './service';

type SuccessResponse = paths["/sample-calc"]["get"]["responses"]["200"]["content"]["application/json"];
type ErrorResponse = paths["/sample-calc"]["get"]["responses"]["400"]["content"]["application/json"];

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const params = event.queryStringParameters || {};

    // バリデーション
    if (
      !params.num1 || !params.num2 ||
      isNaN(Number(params.num1)) || isNaN(Number(params.num2))
    ) {
      const errorBody: ErrorResponse = {
        code: "INVALID_QUERY_PARAMS",
        message: "num1 and num2 must be valid numbers",
      };

      return {
        statusCode: 400,
        body: JSON.stringify(errorBody),
      };
    }

    const num1 = parseFloat(params.num1);
    const num2 = parseFloat(params.num2);

    const calcResult = addNumbers(num1, num2);

    const result: SuccessResponse = {
      date: new Date().toISOString(),
      "calc-result": calcResult,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (e) {
    const errorBody: ErrorResponse = {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    };

    return {
      statusCode: 500,
      body: JSON.stringify(errorBody),
    };
  }
};

```

#### 成果物を圧縮しlambdaへアップロードする

TODO:追記
