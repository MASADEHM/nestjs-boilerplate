# NestJS Starter Development Standards

**⚠️ CRITICAL**: Include this document in all development queries to maintain consistency.

## 🏗️ Architecture Standards

### Project Structure

```
src/
├── modules/            # Business feature modules
│   ├── users/          # Example: User management
│   ├── products/       # Example: Product catalog
│   └── orders/         # Example: Order processing
├── common/             # Shared business utilities
│   ├── types/          # Shared business types
│   ├── constants/      # Shared business constants
│   └── helpers/        # Shared business utilities
└── core/               # Infrastructure modules
    ├── auth/           # Authentication & authorization
    ├── shared/         # Global core services (exceptions, filters, helpers)
    ├── database/       # Database layer (Prisma)
    ├── i18n/           # Internationalization
    ├── notifications/  # Email service
    ├── jobs/           # Background job processing
    ├── config/         # Configuration management
    ├── health/         # Health check endpoints
    └── files/          # File management
```

### Module Template

```
src/modules/[module-name]/
├── constants/           # Module-specific constants and enums
├── types/               # TypeScript interfaces and type definitions
├── dto/
│   ├── request/        # DTOs for request validation
│   ├── response/       # Classes for entities, interfaces for simple DTOs
│   └── index.ts
├── [entity].service.ts
├── [entity].controller.ts
└── [module].module.ts
```

### Path Mapping & Organization

```typescript
// ✅ Use aliases, domain-specific organization
import { ResponseHelper } from '@core/shared/helpers/response.helper';
import { ApiException } from '@core/shared/exceptions/api.exception';
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';

// ❌ Avoid relative imports, monolithic files
import { ResponseHelper } from '../../../core/shared/helpers/response.helper';
```

## 📊 Querying & Pagination Standards

For list endpoints, use Prisma or standard pagination patterns:

```typescript
// Controller - Standard pagination
@Get()
@ApiOperation({ summary: 'Get all items' })
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @I18n() i18n: I18nContext<I18nTranslations>,
  @Res() response: Response
) {
  const result = await this.service.findAll(page, limit);
  const message = i18n.t('common.listRetrieved');
  ResponseHelper.paginated(result, response, message);
}

// Service - Use Prisma
@Injectable()
export class ItemService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number): Promise<PaginatedResponse<Item>> {
    const [data, total] = await Promise.all([
      this.prisma.items.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.items.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
```

## 🔄 Response Types

### Entity Classes (with transformation)

```typescript
export class UserResponse {
  constructor(data: Users) {
    /* exclude password */
  }
  static from(data: Users): UserResponse {
    return new UserResponse(data);
  }
  static fromMany(data: Users[]): UserResponse[] {
    return data.map((item) => UserResponse.from(item));
  }
}
```

### Simple Interfaces (no transformation)

```typescript
export interface UserCreatedResponse {
  id: number;
  email: string;
  status: string;
}
```

## 🚫 Exception Handling

### Service Layer

```typescript
// Use ApiException - translate messages in service, then pass to ApiException
async create(
  dto: CreateDto,
  auditInfo: AuditInfo,
  i18n: I18nContext<I18nTranslations>
): Promise<UserResponse> {
  const auditFields = createAuditFields(auditInfo);

  // Translate messages in service, then pass to ApiException
  const message = i18n.t('users.alreadyExists');
  throw ApiException.conflict(message);

  const message = i18n.t('users.notFound');
  throw ApiException.notFound(message);

  // With parameters
  const message = i18n.t('validation.minLength', {
    args: { min: 8 }
  });
  throw ApiException.badRequest(message);
}
```

### Controller Layer

```typescript
// No try-catch, use decorators, use ResponseHelper with Response object
async create(
  @Body() dto: CreateDto,
  @AuditRequestInfo() auditInfo: AuditInfo,
  @I18n() i18n: I18nContext<I18nTranslations>,
  @Res() response: Response
) {
  const result = await this.service.create(dto, auditInfo, i18n);
  const message = i18n.t('users.created');
  ResponseHelper.created(result, response, message);
}

// Public endpoints (no auth required)
@Controller('public/items')
export class PublicController {
  @Get(':id')
  async getPublicInfo(
    @Param('id') id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Res() response: Response
  ) {
    const result = await this.service.getInfo(id, i18n);
    const message = i18n.t('common.retrieved');
    ResponseHelper.success(result, response, message);
  }
}
```

## 🌐 Internationalization

### Type-Safe Translation Pattern

```typescript
// Import auto-generated types (Generated when running npm run start:dev or build)
import { I18nTranslations } from '@core/i18n/generated/i18n.generated';

// Controllers use @I18n() decorator and pass context to services
async create(
  @Body() dto: CreateDto,
  @AuditRequestInfo() auditInfo: AuditInfo,
  @I18n() i18n: I18nContext<I18nTranslations>,
  @Res() response: Response
) {
  const result = await this.service.create(dto, auditInfo, i18n);
  const message = i18n.t('users.created'); // Type-safe translation key
  ResponseHelper.created(result, response, message);
}

// Services accept I18nContext<I18nTranslations> parameter, not injection
async create(
  dto: CreateDto,
  auditInfo: AuditInfo,
  i18n: I18nContext<I18nTranslations>
): Promise<UserResponse> {
  const auditFields = createAuditFields(auditInfo);

  // Type-safe translation by adding <I18nTranslations>
  const message = i18n.t('users.alreadyExists');
  throw ApiException.conflict(message);

  // With parameters
  const validationMessage = i18n.t('validation.minLength', {
    args: { min: 8 }
  });
  throw ApiException.badRequest(validationMessage);
}

// Translation files structure:
// src/core/i18n/locales/en/[module].json
// src/core/i18n/locales/ar/[module].json
// Auto-generated types: src/core/i18n/generated/i18n.generated.ts
// (Generated when adding keys to locale files and running npm run start:dev or build)
```

## 🔐 Authentication & Authorization

The auth module provides JWT-based authentication:

- `src/core/auth/` - Authentication infrastructure
- JWT guards available for protecting routes
- Use `@CurrentUser()` decorator to get authenticated user

```typescript
// Protected endpoint
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemController {
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}

// Public endpoint (bypass auth)
@Public()
@Get('health')
async healthCheck() {
  return { status: 'ok' };
}
```

## 🔄 Database Transactions

```typescript
// Use Prisma transactions for related operations
const result = await this.prisma.$transaction(async (tx) => {
  const user = await tx.users.create({ data: userData });
  const profile = await tx.profiles.create({
    data: { ...profileData, userId: user.id }
  });
  return { user, profile };
});
```

## 🛠️ Code Quality Standards

- **Errors**: Must fix (blocks CI/CD)
- **Services**: Use `ApiException` not HTTP exceptions
- **Controllers**: No try-catch (let NestJS handle), **always use ResponseHelper for responses**
- **Translation Keys**: Use translation keys directly (they are constants)
- **Nullish Coalescing**: Prefer `??` over `||`
- **Return Types**: Always add explicit return types
- **Response Types**: Classes for entities (data structure), interfaces for simple DTOs
- **Response Wrapper**: Controllers always use ResponseHelper.success/created/paginated with Response object
- **Transactions**: Use Prisma transactions for related database operations
- **Prisma**: Use PrismaService for all database operations

## 🔄 Response Transformer Pattern

### Always Extend BaseResponseTransformer

```typescript
// For simple response classes where properties match entity structure
export class ItemResponse extends BaseResponseTransformer {
  @ApiProperty({ description: 'Item ID' })
  id: number;

  @ApiProperty({ description: 'Item name' })
  name: string;

  @ApiProperty({ description: 'Whether the item is active' })
  is_active: boolean;

  // Properties match entity - rely on inherited transformation methods
  // No need to override from/fromMany - using inherited default behavior
}

// Usage in service - response classes transform themselves
const items = ItemResponse.fromMany(data);
const item = ItemResponse.from(data);
```

### Override Methods for Custom Logic

```typescript
// For complex response classes with custom transformation needs
export class OrderResponse extends BaseResponseTransformer {
  @ApiProperty({ description: 'Order ID' })
  id: number;

  @ApiProperty({ description: 'Has items' })
  has_items: boolean;

  // Override transformation methods when custom logic is needed
  static from(data: Orders & { orderItems?: OrderItems[] }): OrderResponse {
    const response = new OrderResponse();

    // 1. Use setPropertiesFromData for matching attributes
    setPropertiesFromData(response, data, OrderResponse);

    // 2. Apply custom attribute masking/transformation after matching
    response.has_items = (data.orderItems?.length ?? 0) > 0;

    return response;
  }

  static fromMany(data: Orders[]): OrderResponse[] {
    return data.map((item) => OrderResponse.from(item));
  }
}
```

## ❌ Anti-Patterns

```typescript
// ❌ Don't
throw new ConflictException(message);           // Use ApiException
try { await service.create(); } catch { throw; }         // No controller try-catch
ApiException.conflict('users.alreadyExists');            // Translate first, then pass translated message
const value = input || 'default';                        // Use ?? for nullish
created_by: auditInfo.created_by                         // Use createAuditFields(auditInfo)
ResponseHelper.success(result, response, 'msg', i18n)    // Translate first, then pass message

// ✅ Do
const message = i18n.t('users.alreadyExists');
throw ApiException.conflict(message);                    // Pass translated message
const message = i18n.t('users.created');
ResponseHelper.success(result, response, message);       // Pass translated message
const auditFields = createAuditFields(auditInfo);        // Use audit helper
const value = input ?? 'default';                        // Use nullish coalescing
```

## ✅ Quick Checklist

- [ ] Use path aliases (`@core`, `@modules`, `@common`)
- [ ] Use `@I18n()` decorator in controllers and pass `I18nContext<I18nTranslations>` to services
- [ ] Translate first, then pass message:
      `const message = i18n.t('key'); ResponseHelper.success(result, response, message);`
- [ ] Services translate themselves:
      `const message = i18n.t('key'); throw ApiException.conflict(message);`
- [ ] Import auto-generated types:
      `import { I18nTranslations } from '@core/i18n/generated/i18n.generated';`
- [ ] No try-catch in controllers
- [ ] Response classes always extend `BaseResponseTransformer`, override methods for custom logic
- [ ] Explicit return types always
- [ ] Use Prisma for all database operations
- [ ] Use Prisma transactions for related operations

---

**Core Principle**: Clean separation of concerns with self-contained components - **Controllers**
handle HTTP concerns (decorators, validation, response formatting), **Services** contain business
logic and data access, **Response classes** transform themselves (extend BaseResponseTransformer,
override for custom logic), **Consistent patterns** across all modules (error handling, type-safe
translations with auto-generated I18nTranslations types, Prisma for data access).
