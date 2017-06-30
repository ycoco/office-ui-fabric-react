
import * as React from 'react';
import { css } from 'office-ui-fabric-react/lib/Utilities';
import { BaseText } from './BaseText';

export interface ITaxonomyRendererTerm {
    label: string,
    termId: string,
    ariaLabel: string
}

export interface ITaxonomyRendererProps {
    terms: Array<ITaxonomyRendererTerm>;
}

export function TaxonomyRenderer(props: ITaxonomyRendererProps): JSX.Element {
    let terms: Array<ITaxonomyRendererTerm> = props && props.terms || [];

    return (
        <div>
            { (terms.map((term: ITaxonomyRendererTerm, index: number) => (
                <div
                    className={ css('od-UserField', 'od-FieldRender-nofill') }
                    data-is-focusable={ true }
                    aria-label={ term.ariaLabel }
                    key={ index }
                >
                    <span className={ css('ms-noWrap', 'ms-imnSpan', 'ms-displayInlineBlock') }>{ term.label }</span>
                </div>
            ))) }
        </div>
    );
}
