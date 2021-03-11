import React from "react";
import Mustache from "mustache";

import createReactClass from "create-react-class";

import PropTypes from "prop-types";

import naturalSort from "javascript-natural-sort";
import parseCustomMarkdownToReact from "../Custom/parseCustomMarkdownToReact";
import { observer } from "mobx-react";

import Styles from "./data-preview.scss";
import MetadataTable from "./MetadataTable";

naturalSort.insensitive = true;
import { withTranslation } from "react-i18next";
import { item } from "../Custom/Chart/tooltip.scss";
import { runInAction } from "mobx";
import isDefined from "../../Core/isDefined";
import CommonStrata from "../../Models/CommonStrata";
import Collapsible from "../Custom/Collapsible/Collapsible";

const Box = require("../../Styled/Box").default;

Mustache.escape = function(string) {
  return string;
};

/**
 * CatalogItem-defined sections that sit within the preview description. These are ordered according to the catalog item's
 * order if available.
 */
const DataPreviewSections = observer(
  createReactClass({
    displayName: "DataPreviewSections",

    propTypes: {
      metadataItem: PropTypes.object.isRequired,
      t: PropTypes.func.isRequired
    },

    sortInfoSections(items) {
      const infoSectionOrder = this.props.metadataItem.infoSectionOrder;

      items.sort(function(a, b) {
        const aIndex = infoSectionOrder.indexOf(a.name);
        const bIndex = infoSectionOrder.indexOf(b.name);
        if (aIndex >= 0 && bIndex < 0) {
          return -1;
        } else if (aIndex < 0 && bIndex >= 0) {
          return 1;
        } else if (aIndex < 0 && bIndex < 0) {
          return naturalSort(a.name, b.name);
        }
        return aIndex - bIndex;
      });

      return items;
    },

    clickInfoSection(reportName, isOpen) {
      const info = this.props.metadataItem.info;
      const clickedInfo = info.find(report => report.name === reportName);

      if (isDefined(clickedInfo)) {
        runInAction(() => {
          clickedInfo.setTrait(CommonStrata.user, "show", isOpen);
        });
      }
      return false;
    },

    render() {
      const metadataItem = this.props.metadataItem;
      const items = metadataItem.hideSource
        ? metadataItem.infoWithoutSources
        : metadataItem.info.slice();

      return (
        <div>
          <For each="item" index="i" of={this.sortInfoSections(items)}>
            <Box paddedVertically displayInlineBlock fullWidth>
              <Collapsible
                key={i}
                light={false}
                title={item.name}
                isOpen={item.show}
                onToggle={show =>
                  this.clickInfoSection.bind(this, item.name, show)()
                }
                bodyTextProps={{ medium: true }}
              >
                <Choose>
                  <When condition={item.content?.length > 0}>
                    {parseCustomMarkdownToReact(
                      Mustache.render(item.content, metadataItem),
                      {
                        catalogItem: metadataItem
                      }
                    )}
                  </When>
                  <When condition={item.contentAsObject !== undefined}>
                    <p>
                      <MetadataTable metadataItem={item.contentAsObject} />
                    </p>
                  </When>
                </Choose>
              </Collapsible>
            </Box>
          </For>
        </div>
      );
    }
  })
);

export default withTranslation()(DataPreviewSections);
