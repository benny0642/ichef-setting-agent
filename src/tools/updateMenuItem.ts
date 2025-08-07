import { MENU_ITEM_UPDATE_MUTATION } from '../api/gql/updateMenuItemMutation.js';
import { createGraphQLClient } from '../api/graphqlClient.js';
import { IChefMcpTool, McpToolResponse } from '../types/mcpTypes.js';
import {
  ComboItemCategoryInput,
  ItemTagRelationshipPayload,
  MenuItemUpdateResponse,
} from '../types/menuTypes.js';

// 商品更新參數介面
interface UpdateMenuItemArgs {
  uuid: string;
  name?: string;
  price?: number;
  menuItemCategoryUuid?: string;
  type?: 'item' | 'combo';
  enabled?: boolean;
  sortingIndex?: number;
  picture?: string;
  externalId?: string;
  customizedTaxEnabled?: boolean;
  customizedTaxType?: string;
  customizedTaxRate?: number;
  itemTagRelationshipList?: ItemTagRelationshipPayload[];
  comboItemCategories?: ComboItemCategoryInput[];
}

// 格式化更新成功回應的輔助函數
const formatUpdateSuccessResponse = (
  data: MenuItemUpdateResponse,
  args: UpdateMenuItemArgs
): string => {
  const updatedItem = data.restaurant.settings.menu.updateMenuItem;

  let result = '✅ 商品更新成功！\n\n';
  result += `🆔 商品 UUID: ${updatedItem.uuid}\n`;

  // 顯示更新的欄位
  const updatedFields: string[] = [];

  if (args.name !== undefined) {
    updatedFields.push(`📝 商品名稱: ${args.name}`);
  }

  if (args.price !== undefined) {
    updatedFields.push(`💰 價格: $${args.price}`);
  }

  if (args.menuItemCategoryUuid !== undefined) {
    updatedFields.push(`📂 分類 UUID: ${args.menuItemCategoryUuid}`);
  }

  if (args.type !== undefined) {
    updatedFields.push(`🏷️ 類型: ${args.type === 'combo' ? '套餐' : '單品'}`);
  }

  if (args.enabled !== undefined) {
    updatedFields.push(`🔄 狀態: ${args.enabled ? '啟用' : '停用'}`);
  }

  if (args.sortingIndex !== undefined) {
    updatedFields.push(`📊 排序索引: ${args.sortingIndex}`);
  }

  if (args.picture !== undefined) {
    updatedFields.push(`🖼️ 圖片: ${args.picture}`);
  }

  if (args.externalId !== undefined) {
    updatedFields.push(`🔗 外部 ID: ${args.externalId}`);
  }

  if (args.customizedTaxEnabled !== undefined) {
    updatedFields.push(
      `💸 自訂稅務: ${args.customizedTaxEnabled ? '啟用' : '停用'}`
    );
    if (args.customizedTaxEnabled && args.customizedTaxType) {
      updatedFields.push(`   稅務類型: ${args.customizedTaxType}`);
    }
    if (args.customizedTaxEnabled && args.customizedTaxRate !== undefined) {
      updatedFields.push(`   稅率: ${args.customizedTaxRate}%`);
    }
  }

  if (args.itemTagRelationshipList !== undefined) {
    updatedFields.push(
      `📝 商品註記: 已更新 ${args.itemTagRelationshipList.length} 項註記`
    );

    if (args.itemTagRelationshipList.length > 0) {
      updatedFields.push(`   註記詳情:`);
      args.itemTagRelationshipList.forEach((relationship, index) => {
        if (relationship.menuItemTagUuid) {
          updatedFields.push(
            `     ${index + 1}. 🏷️ 商品標籤 UUID: ${relationship.menuItemTagUuid}`
          );
        } else if (relationship.tagGroupUuid) {
          updatedFields.push(
            `     ${index + 1}. 📂 標籤群組 UUID: ${relationship.tagGroupUuid}`
          );
          if (relationship.subTagList && relationship.subTagList.length > 0) {
            updatedFields.push(
              `        子標籤數量: ${relationship.subTagList.length}`
            );
          }
        }
        if (relationship.followingSeparatorCount !== undefined) {
          updatedFields.push(
            `        分隔符數量: ${relationship.followingSeparatorCount}`
          );
        }
      });
    }
  }

  // 顯示套餐結構更新資訊
  if (args.comboItemCategories !== undefined) {
    updatedFields.push(
      `📋 套餐結構: 已更新 ${args.comboItemCategories.length} 個子項目`
    );

    if (args.comboItemCategories.length > 0) {
      updatedFields.push(`   套餐子項目詳情:`);
      args.comboItemCategories.forEach((category, index) => {
        updatedFields.push(`     📂 子項目 ${index + 1}: ${category.name}`);

        if (category.comboMenuItemSortingType) {
          updatedFields.push(
            `        ├─ 排序方式: ${category.comboMenuItemSortingType === 'MANUAL' ? '手動排序' : '字母排序'}`
          );
        }

        if (category.comboMenuItems && category.comboMenuItems.length > 0) {
          updatedFields.push(
            `        └─ 可選品項數量: ${category.comboMenuItems.length} 項`
          );
          category.comboMenuItems.forEach((item, itemIndex) => {
            const priceText = item.price ? ` - 加價 $${item.price}` : '';
            updatedFields.push(
              `           ${itemIndex + 1}. 🍔 品項 UUID: ${item.menuItemUuid}${priceText}`
            );
          });
        } else {
          updatedFields.push(`        └─ 可選品項數量: 0 項`);
        }

        if (index < (args.comboItemCategories?.length ?? 0) - 1) {
          updatedFields.push('');
        }
      });
    }
  }

  if (updatedFields.length > 0) {
    result += '\n📋 更新的欄位:\n';
    updatedFields.forEach(field => {
      result += `${field}\n`;
    });
  } else {
    result += '\n⚠️ 未指定任何要更新的欄位\n';
  }

  return result;
};

const updateMenuItem: IChefMcpTool = {
  name: 'updateMenuItem',
  description: '更新現有商品的資訊，支援部分更新（只更新指定的欄位）',
  category: 'menu',
  version: '1.0.0',
  inputSchema: {
    type: 'object',
    properties: {
      uuid: {
        type: 'string',
        description: '商品 UUID（必填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      name: {
        type: 'string',
        description: '商品名稱（選填）',
        minLength: 1,
        maxLength: 255,
      },
      price: {
        type: 'number',
        description: '商品價格（選填，需為正數）',
        minimum: 0,
      },
      menuItemCategoryUuid: {
        type: 'string',
        description: '商品分類 UUID（選填）',
        pattern:
          '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
      },
      type: {
        type: 'string',
        enum: ['item', 'combo'],
        description: '商品類型（選填）',
      },
      enabled: {
        type: 'boolean',
        description:
          '啟用/停用商品（選填），停用與停售不同，停售要用 updateSoldOutItems',
      },
      sortingIndex: {
        type: 'number',
        description: '商品排序索引（選填）',
        minimum: 0,
      },
      picture: {
        type: 'string',
        description: '商品圖片 URL（選填）',
      },
      externalId: {
        type: 'string',
        description: '外部系統 ID（選填）',
      },
      customizedTaxEnabled: {
        type: 'boolean',
        description: '是否啟用自訂稅務（選填）',
      },
      customizedTaxType: {
        type: 'string',
        description: '自訂稅務類型（選填，例如：TX）',
      },
      customizedTaxRate: {
        type: 'number',
        description: '自訂稅率（選填，百分比）',
        minimum: 0,
        maximum: 100,
      },
      itemTagRelationshipList: {
        type: 'array',
        description: '商品註記列表（選填）',
        items: {
          type: 'object',
          properties: {
            followingSeparatorCount: {
              type: 'number',
              description: '分隔符數量',
              minimum: 0,
            },
            menuItemTagUuid: {
              type: 'string',
              description: '商品標籤 UUID（與 tagGroupUuid 二選一）',
              pattern:
                '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            },
            tagGroupUuid: {
              type: 'string',
              description: '標籤群組 UUID（與 menuItemTagUuid 二選一）',
              pattern:
                '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            },
            subTagList: {
              type: 'array',
              description: '子標籤列表（僅在使用 tagGroupUuid 時需要）',
              items: {
                type: 'object',
                properties: {
                  enabled: {
                    type: 'boolean',
                    description: '是否啟用此子標籤',
                  },
                  subTagUuid: {
                    type: 'string',
                    description: '子標籤 UUID',
                    pattern:
                      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                  },
                },
                required: ['enabled', 'subTagUuid'],
              },
            },
          },
        },
      },
      comboItemCategories: {
        type: 'array',
        description: '套餐子項目列表（選填，僅套餐商品可用）',
        items: {
          type: 'object',
          properties: {
            uuid: {
              type: 'string',
              description: '套餐子項目 UUID（更新時選填）',
              pattern:
                '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            },
            name: {
              type: 'string',
              description: '套餐子項目名稱（必填）',
              minLength: 1,
              maxLength: 255,
            },
            comboMenuItemSortingType: {
              type: 'string',
              enum: ['MANUAL', 'ALPHABETICAL'],
              description: '套餐子項目的可選品項排序類型（選填）',
            },
            comboMenuItems: {
              type: 'array',
              description: '套餐子項目的可選品項列表（選填）',
              items: {
                type: 'object',
                properties: {
                  uuid: {
                    type: 'string',
                    description: '套餐子項目的可選品項 UUID（更新時選填）',
                    pattern:
                      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                  },
                  menuItemUuid: {
                    type: 'string',
                    description: '關聯的單品商品 UUID（必填）',
                    pattern:
                      '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
                  },
                  price: {
                    type: 'string',
                    description: '加價金額（選填，字串格式）',
                    pattern: '^[0-9]+(\\.[0-9]+)?$',
                  },
                },
                required: ['menuItemUuid'],
              },
            },
          },
          required: [
            'name',
          ],
        },
      },
    },
    required: ['uuid'],
  },
  handler: async (args?: Record<string, unknown>): Promise<McpToolResponse> => {
    try {
      // 類型轉換和基本驗證
      const updateArgs = args as unknown as UpdateMenuItemArgs;

      // 驗證必填欄位
      if (!updateArgs.uuid || typeof updateArgs.uuid !== 'string') {
        throw new Error('商品 UUID 是必填項目且必須是字串');
      }

      // 驗證 UUID 格式
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(updateArgs.uuid)) {
        throw new Error('商品 UUID 格式不正確');
      }

      // 驗證是否至少有一個欄位要更新
      const updateableFields = [
        'name',
        'price',
        'menuItemCategoryUuid',
        'type',
        'enabled',
        'sortingIndex',
        'picture',
        'externalId',
        'customizedTaxEnabled',
        'customizedTaxType',
        'customizedTaxRate',
        'itemTagRelationshipList',
        'comboItemCategories',
      ];

      const hasUpdateFields = updateableFields.some(
        field => updateArgs[field as keyof UpdateMenuItemArgs] !== undefined
      );
      if (!hasUpdateFields) {
        throw new Error('至少需要指定一個要更新的欄位');
      }

      // 驗證商品名稱
      if (updateArgs.name !== undefined) {
        if (
          typeof updateArgs.name !== 'string' ||
          updateArgs.name.trim().length === 0
        ) {
          throw new Error('商品名稱必須是非空字串');
        }
      }

      // 驗證商品價格
      if (updateArgs.price !== undefined) {
        if (typeof updateArgs.price !== 'number' || updateArgs.price <= 0) {
          throw new Error('商品價格必須是大於 0 的數字');
        }
      }

      // 驗證分類 UUID
      if (updateArgs.menuItemCategoryUuid !== undefined) {
        if (
          typeof updateArgs.menuItemCategoryUuid !== 'string' ||
          !uuidRegex.test(updateArgs.menuItemCategoryUuid)
        ) {
          throw new Error('商品分類 UUID 格式不正確');
        }
      }

      // 驗證商品類型
      if (updateArgs.type !== undefined) {
        const validTypes = ['item', 'combo'];
        if (!validTypes.includes(updateArgs.type)) {
          throw new Error('商品類型必須是 item 或 combo');
        }
      }

      // 驗證排序索引
      if (updateArgs.sortingIndex !== undefined) {
        if (
          typeof updateArgs.sortingIndex !== 'number' ||
          updateArgs.sortingIndex < 0
        ) {
          throw new Error('排序索引必須是非負數');
        }
      }

      // 驗證自訂稅務設定
      if (updateArgs.customizedTaxRate !== undefined) {
        if (
          typeof updateArgs.customizedTaxRate !== 'number' ||
          updateArgs.customizedTaxRate < 0 ||
          updateArgs.customizedTaxRate > 100
        ) {
          throw new Error('自訂稅率必須是 0-100 之間的數字');
        }
      }

      // 驗證商品註記
      if (updateArgs.itemTagRelationshipList !== undefined) {
        if (!Array.isArray(updateArgs.itemTagRelationshipList)) {
          throw new Error('商品註記列表必須是陣列');
        }

        for (let i = 0; i < updateArgs.itemTagRelationshipList.length; i++) {
          const relationship = updateArgs.itemTagRelationshipList[i];

          // 驗證必須有 menuItemTagUuid 或 tagGroupUuid 其中之一
          if (!relationship.menuItemTagUuid && !relationship.tagGroupUuid) {
            throw new Error(
              `第 ${i + 1} 個註記必須指定 menuItemTagUuid 或 tagGroupUuid`
            );
          }

          // 驗證不能同時有 menuItemTagUuid 和 tagGroupUuid
          if (relationship.menuItemTagUuid && relationship.tagGroupUuid) {
            throw new Error(
              `第 ${i + 1} 個註記不能同時指定 menuItemTagUuid 和 tagGroupUuid`
            );
          }

          // 驗證 UUID 格式
          if (
            relationship.menuItemTagUuid &&
            !uuidRegex.test(relationship.menuItemTagUuid)
          ) {
            throw new Error(`第 ${i + 1} 個註記的 menuItemTagUuid 格式不正確`);
          }

          if (
            relationship.tagGroupUuid &&
            !uuidRegex.test(relationship.tagGroupUuid)
          ) {
            throw new Error(`第 ${i + 1} 個註記的 tagGroupUuid 格式不正確`);
          }

          // 驗證分隔符數量
          if (relationship.followingSeparatorCount !== undefined) {
            if (
              typeof relationship.followingSeparatorCount !== 'number' ||
              relationship.followingSeparatorCount < 0
            ) {
              throw new Error(`第 ${i + 1} 個註記的分隔符數量必須是非負數`);
            }
          }

          // 驗證子標籤列表
          if (relationship.subTagList !== undefined) {
            if (!Array.isArray(relationship.subTagList)) {
              throw new Error(`第 ${i + 1} 個註記的子標籤列表必須是陣列`);
            }

            for (let j = 0; j < relationship.subTagList.length; j++) {
              const subTag = relationship.subTagList[j];

              if (typeof subTag.enabled !== 'boolean') {
                throw new Error(
                  `第 ${i + 1} 個註記的第 ${j + 1} 個子標籤的 enabled 必須是布林值`
                );
              }

              if (!subTag.subTagUuid || !uuidRegex.test(subTag.subTagUuid)) {
                throw new Error(
                  `第 ${i + 1} 個註記的第 ${j + 1} 個子標籤的 subTagUuid 格式不正確`
                );
              }
            }
          }
        }
      }

      // 驗證套餐子項目（僅套餐商品可用）
      if (updateArgs.comboItemCategories !== undefined) {
        // 檢查商品類型是否為套餐
        if (updateArgs.type !== undefined && updateArgs.type !== 'combo') {
          throw new Error('只有套餐商品（combo）可以設定套餐子項目');
        }

        if (!Array.isArray(updateArgs.comboItemCategories)) {
          throw new Error('套餐子項目列表必須是陣列');
        }

        for (let i = 0; i < updateArgs.comboItemCategories.length; i++) {
          const category = updateArgs.comboItemCategories[i];

          // 驗證子項目名稱
          if (!category.name || typeof category.name !== 'string') {
            throw new Error(`第 ${i + 1} 個套餐子項目名稱必須是非空字串`);
          }
          if (category.name.trim().length === 0) {
            throw new Error(`第 ${i + 1} 個套餐子項目名稱不能為空`);
          }
          if (category.name.length > 255) {
            throw new Error(`第 ${i + 1} 個套餐子項目名稱不能超過 255 個字元`);
          }

          // 驗證 UUID（更新時選填）
          if (category.uuid !== undefined && !uuidRegex.test(category.uuid)) {
            throw new Error(`第 ${i + 1} 個套餐子項目的 UUID 格式不正確`);
          }



          // 驗證排序類型（選填）
          if (
            category.comboMenuItemSortingType !== undefined &&
            !['MANUAL', 'ALPHABETICAL'].includes(
              category.comboMenuItemSortingType
            )
          ) {
            throw new Error(
              `第 ${i + 1} 個套餐子項目的 comboMenuItemSortingType 必須是 MANUAL 或 ALPHABETICAL`
            );
          }

          // 驗證套餐子項目的可選品項列表
          if (category.comboMenuItems !== undefined) {
            if (!Array.isArray(category.comboMenuItems)) {
              throw new Error(
                `第 ${i + 1} 個套餐子項目的 comboMenuItems 必須是陣列`
              );
            }

            for (let j = 0; j < category.comboMenuItems.length; j++) {
              const comboItem = category.comboMenuItems[j];

              // 驗證關聯商品 UUID
              if (
                !comboItem.menuItemUuid ||
                !uuidRegex.test(comboItem.menuItemUuid)
              ) {
                throw new Error(
                  `第 ${i + 1} 個套餐子項目的第 ${j + 1} 個可選品項的 menuItemUuid 格式不正確`
                );
              }

              // 驗證可選品項 UUID（更新時選填）
              if (
                comboItem.uuid !== undefined &&
                !uuidRegex.test(comboItem.uuid)
              ) {
                throw new Error(
                  `第 ${i + 1} 個套餐子項目的第 ${j + 1} 個可選品項的 UUID 格式不正確`
                );
              }

              // 驗證加價（選填）
              if (comboItem.price !== undefined) {
                if (typeof comboItem.price !== 'string') {
                  throw new Error(
                    `第 ${i + 1} 個套餐子項目的第 ${j + 1} 個可選品項的 price 必須是字串格式`
                  );
                }
                const priceNum = parseFloat(comboItem.price);
                if (isNaN(priceNum) || priceNum < 0) {
                  throw new Error(
                    `第 ${i + 1} 個套餐子項目的第 ${j + 1} 個可選品項的 price 必須是非負數`
                  );
                }
              }
            }
          }
        }
      }

      // 構建 GraphQL mutation payload（只包含要更新的欄位）
      const payload: Record<string, unknown> = {};

      if (updateArgs.name !== undefined) {
        payload.name = updateArgs.name.trim();
      }

      if (updateArgs.price !== undefined) {
        payload.price = updateArgs.price.toString(); // API 需要字串格式的價格
      }

      if (updateArgs.menuItemCategoryUuid !== undefined) {
        payload.menuItemCategoryUuid = updateArgs.menuItemCategoryUuid;
      }

      if (updateArgs.type !== undefined) {
        payload.type = updateArgs.type;
      }

      if (updateArgs.enabled !== undefined) {
        payload.enabled = updateArgs.enabled;
      }

      if (updateArgs.sortingIndex !== undefined) {
        payload.sortingIndex = updateArgs.sortingIndex;
      }

      if (updateArgs.picture !== undefined) {
        payload.picture = updateArgs.picture;
      }

      if (updateArgs.externalId !== undefined) {
        payload.externalId = updateArgs.externalId;
      }

      if (updateArgs.customizedTaxEnabled !== undefined) {
        payload.customizedTaxEnabled = updateArgs.customizedTaxEnabled;
      }

      if (updateArgs.customizedTaxType !== undefined) {
        payload.customizedTaxType = updateArgs.customizedTaxType;
      }

      if (updateArgs.customizedTaxRate !== undefined) {
        payload.customizedTaxRate = updateArgs.customizedTaxRate.toString();
      }

      if (updateArgs.itemTagRelationshipList !== undefined) {
        payload.itemTagRelationshipList = updateArgs.itemTagRelationshipList;
      }

      if (updateArgs.comboItemCategories !== undefined) {
        payload.comboItemCategories = updateArgs.comboItemCategories.map(category => ({
          ...category,
          allowRepeatableSelection: false,
          minimumSelection: 1,
          maximumSelection: 1,
        }));
      }

      // 建立 GraphQL 客戶端
      const client = createGraphQLClient();

      // 發送 GraphQL mutation
      const data = await client.request<MenuItemUpdateResponse>(
        MENU_ITEM_UPDATE_MUTATION,
        {
          uuid: updateArgs.uuid,
          payload,
        }
      );

      // 檢查回應是否成功
      if (!data.restaurant?.settings?.menu?.updateMenuItem?.uuid) {
        throw new Error('API 回應格式不正確或更新失敗');
      }

      // 格式化成功回應
      const formattedResponse = formatUpdateSuccessResponse(data, updateArgs);

      return {
        content: [
          {
            type: 'text',
            text: formattedResponse,
          },
        ],
      };
    } catch (error) {
      // 詳細的錯誤處理
      let errorMessage = 'Unknown error occurred';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // 根據不同錯誤類型提供不同的錯誤訊息
      if (errorMessage.includes('GRAPHQL_ENDPOINT')) {
        errorMessage =
          '❌ GraphQL 端點未設定，請檢查 .env 檔案中的 GRAPHQL_ENDPOINT';
      } else if (
        errorMessage.includes('GRAPHQL_TOKEN') ||
        errorMessage.includes('Authentication')
      ) {
        errorMessage =
          '❌ 認證 Token 未設定或無效，請檢查 .env 檔案中的 GRAPHQL_TOKEN';
      } else if (errorMessage.includes('fetch')) {
        errorMessage = `❌ 網路連線錯誤，請確認 API 端點是否正確: ${process.env.GRAPHQL_ENDPOINT}`;
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Unauthorized')
      ) {
        errorMessage = '❌ 認證失敗，請檢查 Token 是否正確或已過期';
      } else if (
        errorMessage.includes('403') ||
        errorMessage.includes('Forbidden')
      ) {
        errorMessage = '❌ 權限不足，請檢查 Token 是否有足夠的權限編輯商品';
      } else if (
        errorMessage.includes('400') ||
        errorMessage.includes('Bad Request')
      ) {
        errorMessage = '❌ 請求參數錯誤，請檢查商品資訊是否正確';
      } else if (
        errorMessage.includes('not found') ||
        errorMessage.includes('找不到')
      ) {
        errorMessage = '❌ 找不到指定的商品，請檢查商品 UUID 是否正確';
      } else if (
        errorMessage.includes('duplicate') ||
        errorMessage.includes('已存在')
      ) {
        errorMessage = '❌ 商品名稱已存在，請使用不同的名稱';
      } else if (
        errorMessage.includes('category') ||
        errorMessage.includes('分類')
      ) {
        errorMessage = '❌ 商品分類不存在或無效，請檢查分類 UUID 是否正確';
      } else if (
        errorMessage.includes('套餐子項目') ||
        errorMessage.includes('comboItemCategories')
      ) {
        errorMessage =
          '❌ 套餐子項目設定錯誤，請檢查子項目名稱、選擇規則或可選品項設定';
      } else if (
        errorMessage.includes('可選品項') ||
        errorMessage.includes('comboMenuItems')
      ) {
        errorMessage =
          '❌ 套餐子項目的可選品項設定錯誤，請檢查關聯商品 UUID 或加價設定';
      } else if (
        errorMessage.includes('COMBO_ITEM') ||
        errorMessage.includes('套餐')
      ) {
        errorMessage =
          '❌ 套餐商品相關錯誤，請檢查商品類型是否為套餐或套餐子項目結構是否正確';
      }

      return {
        content: [
          {
            type: 'text',
            text: `🚨 更新商品時發生錯誤:\n\n${errorMessage}\n\n💡 建議檢查:\n- 商品 UUID 是否存在\n- 商品名稱是否重複\n- 分類 UUID 是否存在\n- 價格是否為正數\n- 商品類型是否正確（套餐功能僅適用於 COMBO_ITEM）\n- 套餐子項目選擇規則是否合理（min ≤ max）\n- 關聯的可選品項 UUID 是否有效\n- 網路連線是否正常\n- Token 是否有效\n\n原始錯誤: ${error}`,
          },
        ],
        isError: true,
      };
    }
  },
};

export default updateMenuItem;
