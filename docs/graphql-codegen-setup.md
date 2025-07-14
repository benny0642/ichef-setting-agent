# GraphQL Code Generator 設置指南

本專案使用 GraphQL Code Generator 來自動生成 TypeScript 類型，確保 GraphQL 查詢的類型安全性。

## 安裝的套件

```bash
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-graphql-request
```

## 配置檔案

### `codegen.yml`

```yaml
schema: './schema.json'
documents: 'src/api/gql/**/*.ts'
generates:
  src/types/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
    config:
      # 自定義 scalar 類型映射
      scalars:
        DateTime: string
        Date: string
        Time: string
        JSON: any
        Upload: File
        ID: string
        UTCDateTime: string
        UUID: string
        Decimal: string
        GenericScalar: any
        Dictionary: Record<string, any>
        JSONString: string
        # ... 其他 scalar 類型

      # 其他配置選項
      enumsAsTypes: true
      constEnums: true
      maybeValue: T | null | undefined
      inputMaybeValue: T | null | undefined
      skipTypename: false
      rawRequest: false
      documentMode: string
      dedupeOperationSuffix: true
      omitOperationSuffix: false
      exportFragmentSpreadSubTypes: true
      addDescriptionsToTypes: true
```

## 可用的 NPM 腳本

```bash
# 生成類型（一次性）
npm run codegen

# 監控模式（自動重新生成）
npm run codegen:watch

# 下載最新的 GraphQL schema
npm run download-schema
```

## 使用方式

### 1. 基本使用

```typescript
import { getSdk } from '../types/generated.js';
import { createGraphQLClient } from '../api/graphqlClient.js';

const client = createGraphQLClient();
const sdk = getSdk(client);

// 現在所有的查詢都有完整的類型支援
const result = await sdk.menuItemListingQuery();
```

### 2. 類型安全的查詢

```typescript
import { MenuItemListingQueryQuery } from '../types/generated.js';

async function getMenuItems(): Promise<MenuItemListingQueryQuery> {
  const result = await sdk.menuItemListingQuery();

  // TypeScript 會提供完整的類型檢查和自動完成
  if (result.restaurant?.settings?.menu?.menuItemCategories) {
    result.restaurant.settings.menu.menuItemCategories.forEach(category => {
      console.log(`分類: ${category?.name}`);

      category?.menuItems?.forEach(item => {
        console.log(`品項: ${item?.name}, 價格: ${item?.price}`);
      });
    });
  }

  return result;
}
```

### 3. 變數類型

```typescript
import { MenuItemItemRecordQueryQueryVariables } from '../types/generated.js';

async function getMenuItem(uuid: string) {
  const variables: MenuItemItemRecordQueryQueryVariables = { uuid };
  const result = await sdk.menuItemItemRecordQuery(variables);

  return result.restaurant?.settings?.menu?.menuItem;
}
```

## 工作流程

1. **更新 Schema**: 當 GraphQL schema 有變更時，執行 `npm run download-schema`
2. **生成類型**: 執行 `npm run codegen` 重新生成 TypeScript 類型
3. **開發**: 在開發過程中可以使用 `npm run codegen:watch` 來自動監控變更

## 注意事項

### Fragment 命名

- 確保所有 GraphQL fragment 都有唯一的名稱
- 建議使用描述性的命名，例如：
  - `menuItemBasicFields` -> `menuItemListingBasicFields`
  - `menuItemDetailFields` -> `menuItemDetailBasicFields`

### 類型檢查

- 生成的類型會包含所有可能的 `null` 和 `undefined` 值
- 使用 optional chaining (`?.`) 來安全地訪問嵌套屬性
- TypeScript 會在編譯時檢查類型錯誤

### 最佳實踐

1. **定期更新**: 定期下載最新的 schema 並重新生成類型
2. **類型導入**: 明確導入需要的類型，避免導入整個 generated 檔案
3. **錯誤處理**: 始終處理可能的 `null` 和 `undefined` 值
4. **文檔化**: 為自定義的 GraphQL 查詢添加適當的註釋

## 範例檔案

查看 `src/examples/typedGraphQLExample.ts` 以獲取完整的使用範例。

## 故障排除

### 常見問題

1. **Fragment 名稱衝突**: 確保所有 fragment 都有唯一的名稱
2. **Schema 不是最新**: 執行 `npm run download-schema` 更新 schema
3. **類型錯誤**: 檢查生成的類型檔案是否正確導入

### 重新生成類型

如果遇到問題，可以嘗試：

```bash
# 刪除生成的檔案
rm src/types/generated.ts

# 重新生成
npm run codegen
```
