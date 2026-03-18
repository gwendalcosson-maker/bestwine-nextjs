// app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { importWineList, type ExtractedDrink } from '@/lib/pdf-import'
import { updateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  // Verify secret token
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.REVALIDATE_SECRET

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.restaurant?.name || !Array.isArray(body.drinks)) {
      return NextResponse.json(
        { error: 'Missing required fields: restaurant.name, drinks[]' },
        { status: 400 }
      )
    }

    // Validate each drink has at minimum a name and category
    for (const drink of body.drinks) {
      if (!drink.name || !drink.category) {
        return NextResponse.json(
          {
            error: `Each drink must have 'name' and 'category'. Invalid: ${JSON.stringify(drink)}`,
          },
          { status: 400 }
        )
      }
    }

    const result = await importWineList(
      {
        name: body.restaurant.name,
        country: body.restaurant.country,
        city: body.restaurant.city,
        michelinStars: body.restaurant.michelinStars || 1,
      },
      body.drinks as ExtractedDrink[],
      body.yearOnList
    )

    // Trigger ISR revalidation for affected pages
    updateTag('restaurants')
    updateTag('drinks')
    updateTag('categories')
    if (result.restaurant.slug) {
      updateTag(`restaurant-${result.restaurant.slug}`)
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Imported ${result.drinks.inserted} drinks, ${result.wineListEntries} wine list entries for ${result.restaurant.name}`,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
