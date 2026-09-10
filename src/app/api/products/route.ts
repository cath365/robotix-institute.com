import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse, getPaginationParams, createPaginatedResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Get all products with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pagination = getPaginationParams(searchParams);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    const where: Record<string, unknown> = { isActive: true };
    
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          salePrice: true,
          category: true,
          thumbnail: true,
          images: true,
          stock: true,
          featured: true,
          specs: true,
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { [sortBy]: order },
      }),
      prisma.product.count({ where }),
    ]);

    // Parse specs JSON
    const productsWithParsedSpecs = products.map(p => ({
      ...p,
      specs: p.specs ? JSON.parse(p.specs) : null,
      inStock: p.stock > 0,
    }));

    return NextResponse.json(createPaginatedResponse(productsWithParsedSpecs, total, pagination));
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
