import {
  computed,
  makeObservable,
  observable,
  override,
  runInAction
} from "mobx";
import { CesiumTerrainProvider } from "cesium";
import { IonResource } from "cesium";
import TerriaError from "../../../Core/TerriaError";
import CatalogMemberMixin from "../../../ModelMixins/CatalogMemberMixin";
import MappableMixin from "../../../ModelMixins/MappableMixin";
import UrlMixin from "../../../ModelMixins/UrlMixin";
import CesiumTerrainCatalogItemTraits from "../../../Traits/TraitsClasses/CesiumTerrainCatalogItemTraits";
import CreateModel from "../../Definition/CreateModel";
import { ModelConstructorParameters } from "../../Definition/Model";

export default class CesiumTerrainCatalogItem extends UrlMixin(
  MappableMixin(CatalogMemberMixin(CreateModel(CesiumTerrainCatalogItemTraits)))
) {
  static type = "cesium-terrain";

  /**
   * An observable terrain provider instance set by forceLoadMapItems()
   */
  @observable
  _private_terrainProvider: CesiumTerrainProvider | undefined = undefined;

  constructor(...args: ModelConstructorParameters) {
    super(...args);
    makeObservable(this);
  }

  get type() {
    return CesiumTerrainCatalogItem.type;
  }

  @override
  override get disableZoomTo() {
    return true;
  }

  @computed
  get _private_isTerrainActive() {
    return this.terria.terrainProvider === this._private_terrainProvider;
  }

  @override
  override get shortReport() {
    if (super.shortReport === undefined) {
      const status = this._private_isTerrainActive ? "In use" : "Not in use";
      return `Terrain status: ${status}`;
    }
    return super.shortReport;
  }

  /**
   * Returns a Promise to load the terrain provider
   */
  _private_loadTerrainProvider(): Promise<CesiumTerrainProvider | undefined> {
    const resource =
      this.ionAssetId !== undefined
        ? IonResource.fromAssetId(this.ionAssetId, {
            accessToken:
              this.ionAccessToken ||
              this.terria.configParameters.cesiumIonAccessToken,
            server: this.ionServer
          })
        : this.url;

    if (resource === undefined) {
      return Promise.resolve(undefined);
    }

    return CesiumTerrainProvider.fromUrl(resource, {
      credit: this.attribution
    });
  }

  override async _protected_forceLoadMapItems(): Promise<void> {
    const _private_terrainProvider = await this._private_loadTerrainProvider();
    runInAction(() => {
      this._private_terrainProvider = _private_terrainProvider;
    });
  }

  @computed
  get mapItems() {
    return this.show && this._private_terrainProvider
      ? [this._private_terrainProvider]
      : [];
  }
}