import i18next from "i18next";
import { action, computed, toJS, makeObservable, override } from "mobx";
import { Cartesian3 } from "cesium";
import { Cartographic } from "cesium";
import { clone } from "cesium";
import { Color } from "cesium";
import { HeadingPitchRoll } from "cesium";
import { Matrix3 } from "cesium";
import { Matrix4 } from "cesium";
import { Transforms } from "cesium";
import { CustomDataSource } from "cesium";
import { ClippingPlane } from "cesium";
import { ClippingPlaneCollection } from "cesium";
import AbstractConstructor from "../Core/AbstractConstructor";
import filterOutUndefined from "../Core/filterOutUndefined";
import BoxDrawing from "../Models/BoxDrawing";
import CommonStrata from "../Models/Definition/CommonStrata";
import Model from "../Models/Definition/Model";
import updateModelFromJson from "../Models/Definition/updateModelFromJson";
import SelectableDimensions, {
  SelectableDimension
} from "../Models/SelectableDimensions/SelectableDimensions";
import ClippingPlanesTraits from "../Traits/TraitsClasses/ClippingPlanesTraits";
import HeadingPitchRollTraits from "../Traits/TraitsClasses/HeadingPitchRollTraits";
import LatLonHeightTraits from "../Traits/TraitsClasses/LatLonHeightTraits";

type BaseType = Model<ClippingPlanesTraits> & SelectableDimensions;

function ClippingMixin<T extends AbstractConstructor<BaseType>>(Base: T) {
  abstract class ClippingMixin extends Base {
    _private_clippingBoxDrawing?: BoxDrawing;
    abstract clippingPlanesOriginMatrix(): Matrix4;

    _private_clippingPlaneModelMatrix: Matrix4 = Matrix4.IDENTITY.clone();

    constructor(...args: any[]) {
      super(...args);
      makeObservable(this);
    }

    @computed
    get inverseClippingPlanesOriginMatrix(): Matrix4 {
      return Matrix4.inverse(this.clippingPlanesOriginMatrix(), new Matrix4());
    }

    @computed
    get _private_simpleClippingPlaneCollection() {
      if (!this.clippingPlanes) {
        return;
      }

      if (this.clippingPlanes.planes.length == 0) {
        return;
      }

      const {
        planes,
        enabled = true,
        unionClippingRegions = false,
        edgeColor,
        edgeWidth,
        modelMatrix
      } = this.clippingPlanes;

      const planesMapped = planes.map((plane: any) => {
        return new ClippingPlane(
          Cartesian3.fromArray(plane.normal || []),
          plane.distance
        );
      });

      let options = {
        planes: planesMapped,
        enabled,
        unionClippingRegions
      };

      if (edgeColor && edgeColor.length > 0) {
        options = Object.assign(options, {
          edgeColor: Color.fromCssColorString(edgeColor) || Color.WHITE
        });
      }

      if (edgeWidth && edgeWidth > 0) {
        options = Object.assign(options, { edgeWidth: edgeWidth });
      }

      if (modelMatrix && modelMatrix.length > 0) {
        const array = clone(toJS(modelMatrix));
        options = Object.assign(options, {
          modelMatrix: Matrix4.fromArray(array) || Matrix4.IDENTITY
        });
      }
      return new ClippingPlaneCollection(options);
    }

    @computed
    get clippingBoxPlaneCollection() {
      if (!this.clippingBox.enableFeature) {
        return;
      }

      const clipDirection =
        this.clippingBox.clipDirection === "inside" ? -1 : 1;
      const planes = BoxDrawing.localSidePlanes.map((plane) => {
        return new ClippingPlane(plane.normal, plane.distance * clipDirection);
      });
      const clippingPlaneCollection = new ClippingPlaneCollection({
        planes,
        unionClippingRegions: this.clippingBox.clipDirection === "outside",
        enabled: this.clippingBox.clipModel
      });
      clippingPlaneCollection.modelMatrix =
        this._private_clippingPlaneModelMatrix;
      return clippingPlaneCollection;
    }

    @computed
    get clippingPlaneCollection(): ClippingPlaneCollection | undefined {
      return (
        this._private_simpleClippingPlaneCollection ??
        this.clippingBoxPlaneCollection
      );
    }

    @computed
    get clippingMapItems(): CustomDataSource[] {
      return filterOutUndefined([this.clippingBoxDrawing?.dataSource]);
    }

    @computed
    get clippingBoxDrawing(): BoxDrawing | undefined {
      const options = this.clippingBox;
      const cesium = this.terria.cesium;
      if (
        !cesium ||
        !options.enableFeature ||
        !options.clipModel ||
        !options.showClippingBox
      ) {
        if (this._private_clippingBoxDrawing) {
          this._private_clippingBoxDrawing = undefined;
        }
        return;
      }

      const clippingPlanesOriginMatrix = this.clippingPlanesOriginMatrix();

      const dimensions = new Cartesian3(
        this.clippingBox.dimensions.length ?? 100,
        this.clippingBox.dimensions.width ?? 100,
        this.clippingBox.dimensions.height ?? 100
      );

      let position = LatLonHeightTraits.toCartesian(this.clippingBox.position);
      if (!position) {
        // Use clipping plane origin as position but height set to 0 so that the box is grounded.
        const cartographic = Cartographic.fromCartesian(
          Matrix4.getTranslation(clippingPlanesOriginMatrix, new Cartesian3())
        );
        cartographic.height = dimensions.z / 2;
        position = Cartographic.toCartesian(
          cartographic,
          cesium.scene.globe.ellipsoid,
          new Cartesian3()
        );
      }

      let hpr: HeadingPitchRoll | undefined;
      if (
        this.clippingBox.rotation.heading !== undefined &&
        this.clippingBox.rotation.pitch !== undefined &&
        this.clippingBox.rotation.roll !== undefined
      ) {
        hpr = HeadingPitchRoll.fromDegrees(
          this.clippingBox.rotation.heading,
          this.clippingBox.rotation.pitch,
          this.clippingBox.rotation.roll
        );
      }

      const boxTransform = Matrix4.multiply(
        hpr
          ? Matrix4.fromRotationTranslation(
              Matrix3.fromHeadingPitchRoll(hpr),
              position
            )
          : Transforms.eastNorthUpToFixedFrame(position),
        Matrix4.fromScale(dimensions, new Matrix4()),
        new Matrix4()
      );

      Matrix4.multiply(
        this.inverseClippingPlanesOriginMatrix,
        boxTransform,
        this._private_clippingPlaneModelMatrix
      );

      if (this._private_clippingBoxDrawing) {
        this._private_clippingBoxDrawing.setTransform(boxTransform);
        this._private_clippingBoxDrawing.keepBoxAboveGround =
          this.clippingBox.keepBoxAboveGround;
      } else {
        this._private_clippingBoxDrawing = BoxDrawing.fromTransform(
          cesium,
          boxTransform,
          {
            keepBoxAboveGround: this.clippingBox.keepBoxAboveGround,
            onChange: action(({ modelMatrix, isFinished }) => {
              Matrix4.multiply(
                this.inverseClippingPlanesOriginMatrix,
                modelMatrix,
                this._private_clippingPlaneModelMatrix
              );
              if (isFinished) {
                const position = Matrix4.getTranslation(
                  modelMatrix,
                  new Cartesian3()
                );
                LatLonHeightTraits.setFromCartesian(
                  this.clippingBox.position,
                  CommonStrata.user,
                  position
                );
                const dimensions = Matrix4.getScale(
                  modelMatrix,
                  new Cartesian3()
                );
                updateModelFromJson(
                  this.clippingBox.dimensions,
                  CommonStrata.user,
                  {
                    length: dimensions.x,
                    width: dimensions.y,
                    height: dimensions.z
                  }
                ).logError("Failed to update clipping box dimensions");

                const rotationMatrix = Matrix3.getRotation(
                  Matrix4.getMatrix3(modelMatrix, new Matrix3()),
                  new Matrix3()
                );
                HeadingPitchRollTraits.setFromRotationMatrix(
                  this.clippingBox.rotation,
                  CommonStrata.user,
                  rotationMatrix
                );
              }
            })
          }
        );
      }
      return this._private_clippingBoxDrawing;
    }

    @override
    get selectableDimensions(): SelectableDimension[] {
      if (!this.clippingBox.enableFeature) {
        return super.selectableDimensions;
      }

      return [
        ...super.selectableDimensions,
        {
          type: "checkbox-group",
          id: "clipping-box",
          selectedId: this.clippingBox.clipModel ? "true" : "false",
          options: [
            {
              id: "true",
              name: i18next.t("models.clippingBox.clipModel")
            },
            {
              id: "false",
              name: i18next.t("models.clippingBox.clipModel")
            }
          ],
          setDimensionValue: (stratumId, value) => {
            this.clippingBox.setTrait(stratumId, "clipModel", value === "true");
          },
          selectableDimensions: [
            {
              id: "show-clip-editor-ui",
              type: "checkbox",
              selectedId: this.clippingBox.showClippingBox ? "true" : "false",
              disable: this.clippingBox.clipModel === false,
              options: [
                {
                  id: "true",
                  name: i18next.t("models.clippingBox.showClippingBox")
                },
                {
                  id: "false",
                  name: i18next.t("models.clippingBox.showClippingBox")
                }
              ],
              setDimensionValue: (stratumId, value) => {
                this.clippingBox.setTrait(
                  stratumId,
                  "showClippingBox",
                  value === "true"
                );
              }
            },
            {
              id: "clamp-box-to-ground",
              type: "checkbox",
              selectedId: this.clippingBox.keepBoxAboveGround
                ? "true"
                : "false",
              disable:
                this.clippingBox.clipModel === false ||
                this.clippingBox.showClippingBox === false,
              options: [
                {
                  id: "true",
                  name: i18next.t("models.clippingBox.keepBoxAboveGround")
                },
                {
                  id: "false",
                  name: i18next.t("models.clippingBox.keepBoxAboveGround")
                }
              ],
              setDimensionValue: (stratumId, value) => {
                this.clippingBox.setTrait(
                  stratumId,
                  "keepBoxAboveGround",
                  value === "true"
                );
              }
            },
            {
              id: "clip-direction",
              name: i18next.t("models.clippingBox.clipDirection.name"),
              type: "select",
              selectedId: this.clippingBox.clipDirection,
              disable: this.clippingBox.clipModel === false,
              options: [
                {
                  id: "inside",
                  name: i18next.t(
                    "models.clippingBox.clipDirection.options.inside"
                  )
                },
                {
                  id: "outside",
                  name: i18next.t(
                    "models.clippingBox.clipDirection.options.outside"
                  )
                }
              ],
              setDimensionValue: (stratumId, value) => {
                this.clippingBox.setTrait(stratumId, "clipDirection", value);
              }
            }
          ]
        }
      ];
    }
  }

  return ClippingMixin;
}

export default ClippingMixin;
