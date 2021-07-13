import CommonStrata from "../../lib/Models/Definition/CommonStrata";
import ShapefileCatalogItem from "../../lib/Models/Catalog/CatalogItems/ShapefileCatalogItem";
import Terria from "../../lib/Models/Terria";

describe("ShapefileCatalogItem", function() {
  let terria: Terria;
  let shapefile: ShapefileCatalogItem;

  beforeEach(function() {
    terria = new Terria({
      baseUrl: "./"
    });
    shapefile = new ShapefileCatalogItem("test-shapefile", terria);
  });

  it("works by URL in EPSG:28356", async function() {
    shapefile.setTrait(
      CommonStrata.user,
      "url",
      "test/Shapefile/bike_racks.zip"
    );
    await shapefile.loadMapItems();
    expect(shapefile.mapItems.length).toEqual(1);
    expect(shapefile.mapItems[0].entities.values.length).toBeGreaterThan(0);
    expect(shapefile.mapItems[0].entities.values[0].position).toBeDefined();
  });

  it("works by URL in CRS:84", async function() {
    shapefile.setTrait(
      CommonStrata.user,
      "url",
      "test/Shapefile/cemeteries.zip"
    );
    await shapefile.loadMapItems();
    expect(shapefile.mapItems.length).toEqual(1);
    expect(shapefile.mapItems[0].entities.values.length).toBeGreaterThan(0);
    expect(shapefile.mapItems[0].entities.values[0].position).toBeDefined();
  });
});
