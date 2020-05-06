// import React from 'react';
// import { action } from '@storybook/addon-actions';
// import { Form, FormValues, Input, RenderFunction } from '../components/Form';
// import { Card } from '../components/Layout';

// export default {
  // title: 'Form',
  // component: Form,
  // decorators: [
    // (storyFn: () => React.ReactNode): React.ReactNode => (
      // <div className="storybook-form">{storyFn()}</div>
    // ),
  // ],
// };

// interface StoryValues extends FormValues {
  // select: string;
  // textarea: string;
  // text: string;
  // password: string;
  // num: number;
  // range: number;
  // date: string;
  // datetimeLocal: string;
  // month: string;
  // week: string;
  // time: string;
  // checkbox: boolean;
  // radio: string;
  // color: string;
  // email: string;
  // url: string;
  // search: string;
  // tel: string;
  // file: string;
// }

// const initialValuesEmpty = {
  // select: '',
  // textarea: '',
  // text: '',
  // password: '',
  // num: '',
  // range: '',
  // date: '',
  // datetimeLocal: '',
  // month: '',
  // week: '',
  // time: '',
  // checkbox: false,
  // radio: '',
  // color: '',
  // email: '',
  // url: '',
  // search: '',
  // tel: '',
  // file: '',
// }

// const initialValues: StoryValues = {
  // select: 'bar',
  // textarea: 'textarea',
  // text: 'text',
  // password: 'password',
  // num: 5,
  // range: 5,
  // date: '2020-04-16',
  // datetimeLocal: '2020-04-29T12:00:33',
  // month: '2020-04',
  // week: '2020-W16',
  // time: '12:04',
  // checkbox: false,
  // radio: 'bar',
  // color: '#ff0000',
  // email: 'foo@example.com',
  // url: 'http://foo.example.com',
  // search: 'string',
  // tel: '+46731234567',
  // file: '',
// };

// const actions = {
  // handleSubmit: action('submit'),
  // handleChange: action('change'),
  // handleBlur: action('blur'),
  // handleReset: action('reset')
// }

// const render: RenderFunction = (values: StoryValues, events) => (
  // <React.Fragment>
    // <div className="fields">

      // <label htmlFor="select">
        // Select
        // <Input.Select
          // name="select"
          // id="select"
          // value={values.select}
          // {...events} >
          // <option value="foo">Foo</option>
          // <option value="bar">Bar</option>
          // <option value="zot">Zot</option>
        // </Input.Select>
      // </label>

      // <label htmlFor="textarea">
        // Textarea
        // <textarea
          // name="textarea"
          // id="textarea"
          // value={values.textarea}
          // {...events}
        // />
      // </label>

      // <label htmlFor="text">
        // Text
        // <input
          // type="text"
          // name="text"
          // id="text"
          // value={values.text}
          // {...events}
        // />
      // </label>

      // <label htmlFor="password">
        // Password
        // <input
          // type="password"
          // name="password"
          // id="password"
          // value={values.password}
          // {...events}
        // />
      // </label>

      // <label htmlFor="num">
        // Number
        // <input type="number"
          // name="num"
          // id="num"
          // value={values.num}
          // {...events}
        // />
      // </label>

      // <label htmlFor="range">
        // Range
        // <input
          // type="range"
          // name="range"
          // id="range"
          // value={values.range}
          // min="0"
          // max="10"
          // step="0.1"
          // {...events}
        // />
      // </label>

      // <label className="inline" htmlFor="checkbox">
        // <Input.Checkbox
          // name="checkbox"
          // id="checkbox"
          // checked={values.checkbox}
          // {...events}
        // />
        // <span className="title">Checkbox</span>
      // </label>

      // <fieldset>
        // <legend>Radio</legend>
        // <label className="inline" htmlFor="foo">
          // <Input.Radio
            // name="radio"
            // id="foo"
            // value="foo"
            // checked={values.radio === 'foo'}
            // {...events}
          // />
          // <span className="title">Foo</span>
        // </label>
        // <label className="inline" htmlFor="bar">
          // <Input.Radio
            // name="radio"
            // id="bar"
            // value="bar"
            // checked={values.radio === 'bar'}
            // {...events}
          // />
          // <span className="title">Bar</span>
        // </label>
        // <label className="inline"htmlFor="zot">
          // <span className="title">Zot</span>
          // <Input.Radio
            // name="radio"
            // id="zot"
            // value="zot"
            // checked={values.radio === 'zot'}
            // {...events}
          // />
        // </label>
      // </fieldset>

      // <label htmlFor="color">
        // Color
        // <input
          // type="color"
          // name="color"
          // id="color"
          // value={values.color}
          // {...events}
        // />
      // </label>

      // <label htmlFor="date">
        // Date
        // <input
          // type="date"
          // name="date"
          // id="date"
          // value={values.date}
          // {...events}
        // />
      // </label>

      // <label htmlFor="datetimeLocal">
        // Date Time Local
        // <input
          // type="datetime-local"
          // name="datetimeLocal"
          // id="datetimeLocal"
          // value={values.datetimeLocal}
          // {...events}
        // />
      // </label>

      // <label htmlFor="month">
        // Month
        // <input
          // type="month"
          // name="month"
          // id="month"
          // value={values.month}
          // {...events}
        // />
      // </label>

      // <label htmlFor="week">
        // Week
        // <input
          // type="week"
          // name="week"
          // id="week"
          // value={values.week}
          // {...events}
        // />
      // </label>

      // <label htmlFor="time">
        // Time
        // <input
          // type="time"
          // name="time"
          // id="time"
          // value={values.time}
          // {...events}
        // />
      // </label>

      // <label htmlFor="email">
        // E-mail
        // <input
          // type="email"
          // name="email"
          // id="email"
          // value={values.email}
          // {...events}
        // />
      // </label>

      // <label htmlFor="tel">
        // Telephone
        // <input
          // type="tel"
          // name="tel"
          // id="tel"
          // value={values.tel}
          // {...events}
        // />
      // </label>

      // <label htmlFor="url">
        // URL
        // <input
          // type="url"
          // name="url"
          // id="url"
          // value={values.url}
          // {...events}
        // />
      // </label>

      // <label htmlFor="search">
        // Search
        // <input
          // type="search"
          // name="search"
          // id="search"
          // value={values.search}
          // {...events}
        // />
      // </label>

      // <label htmlFor="file">
        // File
        // <input
          // type="file"
          // name="file"
          // id="file"
          // value={values.file}
          // {...events}
        // />
      // </label>

    // </div>

    // <input type="submit" value="Submit Input" />
    // <input type="button" value="Button Input" />
    // <input type="reset" value="Reset Input" />

    // <button type="submit">Submit Button</button>
    // <button type="button">Button Button</button>
    // <button type="reset">Reset Button</button>
  // </React.Fragment>
// )

// export const Default: React.FunctionComponent = () => {
  // return (
    // <Card>
      // <Form
        // {...actions}
        // initialValues={initialValues}
        // render={render}
      // />
    // </Card>
  // );
// };

// export const Empty: React.FunctionComponent = () => {
  // return (
    // <Card>
      // <Form
        // {...actions}
        // initialValues={initialValuesEmpty}
        // render={render}
      // />
    // </Card>
  // );
// };

