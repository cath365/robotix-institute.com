import { NextRequest, NextResponse } from 'next/server';
import { createApiResponse, createErrorResponse } from '@/lib/api-utils';
import prisma from '@/lib/prisma';

interface Params {
  params: { slug: string };
}

// Get product by slug
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
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
        createdAt: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        createErrorResponse('Product not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createApiResponse({
        ...product,
        specs: product.specs ? JSON.parse(product.specs) : null,
        inStock: product.stock > 0,
      })
    );
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
