import { vi } from "vitest";

type TxClient = {
  booking: {
    findFirst: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  user: {
    update: ReturnType<typeof vi.fn>;
  };
};

const mockTx: TxClient = {
  booking: {
    findFirst: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
};

const mockPrisma = {
  booking: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  session: {
    findUnique: vi.fn(),
  },
  class: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((fn: (tx: TxClient) => unknown) => fn(mockTx)),
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

export { mockPrisma, mockTx };
